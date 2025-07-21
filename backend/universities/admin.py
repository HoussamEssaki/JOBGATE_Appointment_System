from django.contrib import admin
from .models import UniversityProfile  # Assuming you have this model defined
# Remove the import for University and UniversityStaff
# from .models import University, UniversityStaff

@admin.register(UniversityProfile)  # Register the UniversityProfile model
class UniversityProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'base_user', 'created_by', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('display_name', 'base_user__username', 'base_user__email')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('base_user', 'display_name')
        }),
        ('Audit Information', {
            'fields': ('created_by', 'updated_by', 'current_task_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# If you have a UniversityStaff model, ensure it is defined in models.py
# If not, remove any related code from here as well.
