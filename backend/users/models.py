# FileName: MultipleFiles/models.py (users app)
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# Assuming BaseModel is in common/models.py
# from common.models import BaseModel

class BaseModel(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="The time when the object was created.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="The time when the object was last updated.",
    )

    class Meta:
        abstract = True

class Role(models.TextChoices):
        ADMIN = "admin", "Admin" # Ensure these are correctly defined
        UNIVERSITY_STAFF = "university_staff", "University Staff"
        TALENT = "talent", "Talent"
        RECRUITER = "recruiter", "Recruiter"


class User(AbstractUser, BaseModel):
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=Role.choices)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    # Add a OneToOneField to UniversityProfile for university staff users
    # This assumes UniversityProfile is defined in universities.models
    # from universities.models import UniversityProfile # Add this import
    # university_profile = models.OneToOneField(
    #     'universities.UniversityProfile',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='base_user_link', # Or a more descriptive name
    #     limit_choices_to={'user_type': Role.UNIVERSITY_STAFF} # Optional: only link staff users
    # )
    # NOTE: UniversityProfile already has base_user as OneToOneField to User.
    # So, you can access user.university_profile directly. No need for this field here.

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'user_type']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        db_table = 'users'

class UserPreferences(BaseModel):
    MEETING_TYPE_CHOICES = [
        ('in_person', 'In Person'),
        ('online', 'Online'),
        ('phone', 'Phone'),
        ('any', 'Any'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    email_reminders_enabled = models.BooleanField(default=True)
    reminder_24h_enabled = models.BooleanField(default=True)
    reminder_1h_enabled = models.BooleanField(default=True)
    preferred_meeting_type = models.CharField(
        max_length=20,
        choices=MEETING_TYPE_CHOICES,
        default='in_person'
    )
    user_timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Preferences for {self.user.email}"

    class Meta:
        db_table = 'user_preferences'
