from rest_framework import serializers
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import UserPreferences
from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer # type: ignore

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    """Custom user creation serializer"""

    _has_phone_field = True
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'phone_number', 'password1', 'password2')
        
    def validate_user_type(self, value):
        """Validate user type"""
        if value not in ['talent', 'university_staff', 'admin']:
            raise serializers.ValidationError("Invalid user type")
        return value.lower()

class UserSerializer(BaseUserSerializer):
    """Custom user serializer"""
    
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'user_type', 
                 'phone_number', 'is_active', 'last_login', 'date_joined', 'birth', 'location', 'bio', 'profile_image')
        read_only_fields = ('id', 'date_joined', 'last_login')

class UserPreferencesSerializer(serializers.ModelSerializer):
    """User preferences serializer"""
    
    class Meta:
        model = UserPreferences
        fields = '__all__'
        read_only_fields = ('user',)

class UserProfileSerializer(serializers.ModelSerializer):
    """Extended user profile serializer"""
    preferences = UserPreferencesSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'user_type',
                 'phone_number', 'is_active', 'last_login', 'date_joined', 'preferences')
        read_only_fields = ('id', 'date_joined', 'last_login', 'email', 'user_type')

class CustomRegisterSerializer(BaseRegisterSerializer):
    # Tell allauth that we do have a phone field
    _has_phone_field = True