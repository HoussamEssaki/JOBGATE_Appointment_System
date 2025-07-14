from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('talent', 'Talent'),
        ('recruiter', 'Recruiter'),
        ('university_staff', 'University Staff'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    user_timezone = models.CharField(max_length=50, default='UTC')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'user_type']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = 'users'

class UserPreferences(models.Model):
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
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
    
    class Meta:
        db_table = 'user_preferences'

