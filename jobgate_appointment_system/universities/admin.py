from django.contrib import admin
from .models import University, UniversityStaff

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'contact_email', 'is_active', 'created_at')
    list_filter = ('is_active', 'country', 'created_at')
    search_fields = ('name', 'city', 'country', 'contact_email')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Location', {
            'fields': ('address', 'city', 'country')
        }),
        ('Contact Information', {
            'fields': ('website_url', 'contact_email', 'contact_phone')
        }),
        ('Branding', {
            'fields': ('logo_url',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

class UniversityStaffInline(admin.TabularInline):
    model = UniversityStaff
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('user', 'position', 'department', 'is_active')

@admin.register(UniversityStaff)
class UniversityStaffAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'position', 'department', 'is_active', 'created_at')
    list_filter = ('is_active', 'university', 'position', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email', 
                    'university__name', 'position', 'department')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Staff Member', {
            'fields': ('user', 'university')
        }),
        ('Position Information', {
            'fields': ('position', 'department', 'bio')
        }),
        ('Specializations', {
            'fields': ('specializations',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'university')

# Add inline to University admin
UniversityAdmin.inlines = [UniversityStaffInline]

