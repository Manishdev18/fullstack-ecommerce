from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def create_jwt_tokens_for_user(user):
    """
    Create JWT access and refresh tokens for a given user.
    
    Args:
        user: User instance
        
    Returns:
        dict: Contains 'access' and 'refresh' tokens
    """
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def create_jwt_tokens_by_email(email):
    """
    Create JWT tokens for a user by email.
    
    Args:
        email: User's email address
        
    Returns:
        dict: Contains 'access' and 'refresh' tokens or None if user not found
    """
    try:
        user = User.objects.get(email=email)
        return create_jwt_tokens_for_user(user)
    except User.DoesNotExist:
        return None


def create_jwt_tokens_by_phone(phone_number):
    """
    Create JWT tokens for a user by phone number.
    
    Args:
        phone_number: User's phone number
        
    Returns:
        dict: Contains 'access' and 'refresh' tokens or None if user not found
    """
    try:
        user = User.objects.get(phone__phone_number=phone_number)
        return create_jwt_tokens_for_user(user)
    except User.DoesNotExist:
        return None 