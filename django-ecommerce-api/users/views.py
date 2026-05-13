from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from google.auth.transport import requests as google_auth_requests
from google.oauth2 import id_token as google_id_token
import logging
from dj_rest_auth.registration.views import RegisterView
from rest_framework import permissions, status
from rest_framework.generics import (
    GenericAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import Address, PhoneNumber, Profile
from users.permissions import IsUserAddressOwner, IsUserProfileOwner
from users.serializers import (
    AddressReadOnlySerializer,
    PhoneNumberSerializer,
    ProfileSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    VerifyPhoneNumberSerialzier,
)

User = get_user_model()
logger = logging.getLogger(__name__)


def build_jwt_login_payload(user):
    """Same JWT + user payload shape as email/password login."""
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    access["email"] = user.email
    access["first_name"] = user.first_name
    access["last_name"] = user.last_name
    if hasattr(user, "phone") and user.phone:
        access["phone_number"] = str(user.phone.phone_number)
    return {
        "access": str(access),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": str(user.phone.phone_number)
            if hasattr(user, "phone") and user.phone
            else None,
            "is_active": user.is_active,
            "date_joined": user.date_joined.isoformat(),
        },
    }


class UserRegisterationAPIView(RegisterView):
    """
    Register new users using phone number or email and password.
    """

    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        response_data = {"detail": _("User registered successfully.")}
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class UserLoginAPIView(GenericAPIView):
    """
    Authenticate existing users using phone number or email and password.
    Returns JWT tokens that can be used as Bearer tokens.
    """

    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data["user"]
        return Response(build_jwt_login_payload(user), status=status.HTTP_200_OK)


class GoogleIdTokenLoginAPIView(APIView):
    """
    Sign in or sign up with a Google ID token (GIS credential).
    POST JSON: {"id_token": "..."} or {"credential": "..."}
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", "") or ""
        if not client_id.strip():
            logger.warning(
                "GoogleIdTokenLoginAPIView: GOOGLE_CLIENT_ID is empty — set it in .env "
                "(same Web client ID as REACT_APP_GOOGLE_CLIENT_ID on the frontend)."
            )
            return Response(
                {
                    "detail": _(
                        "Google sign-in is not configured on the server. "
                        "Set GOOGLE_CLIENT_ID in the Django environment (same value as "
                        "REACT_APP_GOOGLE_CLIENT_ID on the frontend)."
                    ),
                    "code": "google_not_configured",
                },
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        raw_token = request.data.get("id_token") or request.data.get("credential")
        if not raw_token or not isinstance(raw_token, str):
            return Response(
                {"detail": _("Missing id_token or credential.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = google_id_token.verify_oauth2_token(
                raw_token,
                google_auth_requests.Request(),
                client_id,
            )
        except ValueError as exc:
            return Response(
                {"detail": _("Invalid Google token."), "error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        iss = idinfo.get("iss")
        if iss not in ("accounts.google.com", "https://accounts.google.com"):
            return Response(
                {"detail": _("Invalid token issuer.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = (idinfo.get("email") or "").strip()
        if not email:
            return Response(
                {"detail": _("Google account has no email address.")},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not idinfo.get("email_verified", False):
            return Response(
                {"detail": _("Google email is not verified.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email_norm = email.lower()
        given = (idinfo.get("given_name") or "")[:150]
        family = (idinfo.get("family_name") or "")[:150]

        user = User.objects.filter(email__iexact=email_norm).first()
        if user is None:
            username_base = email_norm[:150]
            username = username_base
            n = 0
            while User.objects.filter(username=username).exists():
                n += 1
                suffix = f"_{n}"
                username = f"{username_base[: 150 - len(suffix)]}{suffix}"
            user = User.objects.create_user(
                username=username,
                email=email_norm,
                password=None,
                first_name=given,
                last_name=family,
            )
        else:
            if given and not user.first_name:
                user.first_name = given
            if family and not user.last_name:
                user.last_name = family
            user.save(update_fields=["first_name", "last_name"])

        if not user.is_active:
            return Response(
                {"detail": _("This account is disabled.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(build_jwt_login_payload(user), status=status.HTTP_200_OK)


class SendOrResendSMSAPIView(GenericAPIView):
    """
    Check if submitted phone number is a valid phone number and send OTP.
    """

    serializer_class = PhoneNumberSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Send OTP
            phone_number = str(serializer.validated_data["phone_number"])

            user = User.objects.filter(phone__phone_number=phone_number).first()

            sms_verification = PhoneNumber.objects.filter(
                user=user, is_verified=False
            ).first()

            sms_verification.send_confirmation()

            return Response(status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPhoneNumberAPIView(GenericAPIView):
    """
    Check if submitted phone number and OTP matches and verify the user.
    """

    serializer_class = VerifyPhoneNumberSerialzier

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            message = {"detail": _("Phone number successfully verified.")}
            return Response(message, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileAPIView(RetrieveUpdateAPIView):
    """
    Get, Update user profile
    """

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsUserProfileOwner,)

    def get_object(self):
        return self.request.user.profile


class UserAPIView(RetrieveAPIView):
    """
    Get user details
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class AddressViewSet(ReadOnlyModelViewSet):
    """
    List and Retrieve user addresses
    """

    queryset = Address.objects.all()
    serializer_class = AddressReadOnlySerializer
    permission_classes = (IsUserAddressOwner,)

    def get_queryset(self):
        res = super().get_queryset()
        user = self.request.user
        return res.filter(user=user)


# Example view for manual JWT token creation
class CreateJWTTokenAPIView(GenericAPIView):
    """
    Example view to demonstrate manual JWT token creation.
    This is for demonstration purposes - you might want to restrict access.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        from .utils import create_jwt_tokens_for_user

        # Create tokens for the current user
        tokens = create_jwt_tokens_for_user(request.user)

        return Response(
            {
                "message": "JWT tokens created successfully",
                "tokens": tokens,
                "user": {
                    "id": request.user.id,
                    "email": request.user.email,
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )
