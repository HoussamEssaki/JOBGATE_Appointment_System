from django.db import models
from common.models import BaseModel
from users.models import User

class UniversityProfileManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(base_user__is_deleted=False)

class UniversityProfile(BaseModel):
    """Model representing a university profile."""

    base_user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="university_profile"
    )
    display_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_university"
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="updated_university",
        null=True,
        blank=True,
    )
    current_task_id = models.CharField(max_length=200, null=True, blank=True)

    objects = UniversityProfileManager()
    all_objects = models.Manager()

    def __str__(self) -> str:
        return self.base_user.first_name


