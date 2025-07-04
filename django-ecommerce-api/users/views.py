from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import RegisterView, SocialLoginView
from dj_rest_auth.views import LoginView
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _
from rest_framework import permissions, status
from rest_framework.generics import (
    GenericAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.response import Response
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


class UserRegisterationAPIView(RegisterView):
    """
    Register new users using phone number or email and password.
    """

    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        print("request.data", request.data)
        serializer = self.get_serializer(data=request.data)
        print("serializer.is_valid():", serializer.is_valid())
        if not serializer.is_valid():
            print("serializer.errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        response_data = {"detail": _("User registered successfully.")}

        # TODO: Temporarily commented out email and phone number verification
        # email = request.data.get("email", None)
        # phone_number = request.data.get("phone_number", None)

        # if email and phone_number:
        #     res = SendOrResendSMSAPIView.as_view()(request._request, *args, **kwargs)

        #     if res.status_code == 200:
        #         response_data = {"detail": _("Verification e-mail and SMS sent.")}

        # elif email and not phone_number:
        #     response_data = {"detail": _("Verification e-mail sent.")}

        # else:
        #     res = SendOrResendSMSAPIView.as_view()(request._request, *args, **kwargs)

        #     if res.status_code == 200:
        #         response_data = {"detail": _("Verification SMS sent.")}

        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class UserLoginAPIView(GenericAPIView):
    """
    Authenticate existing users using phone number or email and password.
    Returns JWT tokens that can be used as Bearer tokens.
    """

    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens using rest_framework_simplejwt
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # Add custom claims if needed
            access['email'] = user.email
            access['first_name'] = user.first_name
            access['last_name'] = user.last_name
            if hasattr(user, 'phone') and user.phone:
                access['phone_number'] = str(user.phone.phone_number)
            
            data = {
                'access': str(access),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone_number': str(user.phone.phone_number) if hasattr(user, 'phone') and user.phone else None,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat(),
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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


class GoogleLogin(SocialLoginView):
    """
    Social authentication with Google
    """

    adapter_class = GoogleOAuth2Adapter
    callback_url = "call_back_url"
    client_class = OAuth2Client


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
        
        return Response({
            'message': 'JWT tokens created successfully',
            'tokens': tokens,
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            }
        }, status=status.HTTP_200_OK)
