from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField

class University(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'universities'
        verbose_name_plural = 'Universities'

class UniversityStaff(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='university_staff')
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='staff')
    position = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    specializations = ArrayField(
        models.CharField(max_length=100),
        size=10,
        default=list,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.university.name}"
    
    class Meta:
        db_table = 'university_staff'
        unique_together = ['user', 'university']
        verbose_name_plural = 'University Staff'

