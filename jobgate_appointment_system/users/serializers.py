from rest_framework import serializers
from .models import User, UserPreferences, Role
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer

class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source=\'get_user_type_display\', read_only=True)

    class Meta:
        model = User
        fields = [
            \'id\', \'username\', \'email\', \'first_name\', \'last_name\', \'user_type\',
            \'phone_number\', \'is_active\', \'created_at\', \'updated_at\', \'last_login\'
        ]
        read_only_fields = [\'id\', \'created_at\', \'updated_at\', \'last_login\']


class UserCreateSerializer(DjoserUserCreateSerializer):
    user_type = serializers.ChoiceField(choices=Role.choices)

    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = (
            \'id\', \'username\', \'email\', \'password\', \'first_name\', \'last_name\', \'user_type\',
            \'phone_number\'
        )


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            \'email_reminders_enabled\', \'reminder_24h_enabled\', \'reminder_1h_enabled\',
            \'preferred_meeting_type\', \'user_timezone\', \'language\', \'notification_preferences\'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    preferences = UserPreferencesSerializer(read_only=True)
    user_type = serializers.CharField(source=\'get_user_type_display\', read_only=True)

    class Meta:
        model = User
        fields = [
            \'id\', \'username\', \'email\', \'first_name\', \'last_name\', \'user_type\',
            \'phone_number\', \'preferences\'
        ]
        read_only_fields = [\'id\', \'user_type\']




