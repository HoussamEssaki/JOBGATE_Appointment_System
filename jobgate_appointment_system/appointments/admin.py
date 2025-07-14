from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AppointmentTheme, Agenda, CalendarSlot, Appointment,
    AppointmentStatistics, EmailReminder, AgendaStaffAssignment,
    TalentEligibilityCriteria, AppointmentAttachment
)

@admin.register(AppointmentTheme)
class AppointmentThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_display', 'icon', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    def color_display(self, obj):
        if obj.color_code:
            return format_html(
                '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
                obj.color_code,
                obj.color_code
            )
        return '-'
    color_display.short_description = 'Color'

class AgendaStaffAssignmentInline(admin.TabularInline):
    model = AgendaStaffAssignment
    extra = 0
    fields = ('staff', 'role', 'is_primary')

class TalentEligibilityCriteriaInline(admin.TabularInline):
    model = TalentEligibilityCriteria
    extra = 0
    fields = ('criteria_type', 'criteria_value', 'is_required')

@admin.register(Agenda)
class AgendaAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'theme', 'created_by', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'theme', 'university', 'is_recurring', 'created_at')
    search_fields = ('name', 'description', 'university__name', 'created_by__user__first_name', 'created_by__user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'theme')
        }),
        ('Organization', {
            'fields': ('university', 'created_by')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'is_recurring', 'recurrence_pattern')
        }),
        ('Slot Configuration', {
            'fields': ('slot_duration_minutes', 'max_capacity_per_slot')
        }),
        ('Booking Rules', {
            'fields': ('booking_deadline_hours', 'cancellation_deadline_hours')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AgendaStaffAssignmentInline, TalentEligibilityCriteriaInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'university', 'theme', 'created_by__user'
        )

@admin.register(CalendarSlot)
class CalendarSlotAdmin(admin.ModelAdmin):
    list_display = ('agenda', 'staff_name', 'slot_date', 'start_time', 'end_time', 
                   'booking_status', 'status', 'meeting_type')
    list_filter = ('status', 'meeting_type', 'slot_date', 'agenda__university')
    search_fields = ('agenda__name', 'staff__user__first_name', 'staff__user__last_name', 'location')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'slot_date'
    
    fieldsets = (
        ('Slot Information', {
            'fields': ('agenda', 'staff', 'slot_date')
        }),
        ('Time', {
            'fields': ('start_time', 'end_time')
        }),
        ('Capacity', {
            'fields': ('max_capacity', 'current_bookings', 'status')
        }),
        ('Meeting Details', {
            'fields': ('meeting_type', 'location', 'meeting_link', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def staff_name(self, obj):
        return f"{obj.staff.user.first_name} {obj.staff.user.last_name}"
    staff_name.short_description = 'Staff Member'
    
    def booking_status(self, obj):
        return f"{obj.current_bookings}/{obj.max_capacity}"
    booking_status.short_description = 'Bookings'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'agenda', 'staff__user'
        )

class AppointmentAttachmentInline(admin.TabularInline):
    model = AppointmentAttachment
    extra = 0
    readonly_fields = ('uploaded_at',)
    fields = ('file_name', 'file_path', 'file_type', 'uploaded_by', 'uploaded_at')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'talent_name', 'agenda_name', 'appointment_date', 
                   'appointment_time', 'status', 'rating')
    list_filter = ('status', 'calendar_slot__slot_date', 'calendar_slot__agenda__university', 'rating')
    search_fields = ('booking_reference', 'talent__first_name', 'talent__last_name', 
                    'talent__email', 'calendar_slot__agenda__name')
    readonly_fields = ('booking_reference', 'booked_at', 'created_at', 'updated_at')
    date_hierarchy = 'calendar_slot__slot_date'
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('booking_reference', 'calendar_slot', 'talent', 'status')
        }),
        ('Notes', {
            'fields': ('talent_notes', 'staff_notes')
        }),
        ('Feedback', {
            'fields': ('rating', 'feedback')
        }),
        ('Reminders', {
            'fields': ('reminder_sent_24h', 'reminder_sent_1h', 'confirmation_sent'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('booked_at', 'cancelled_at', 'completed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AppointmentAttachmentInline]
    
    def talent_name(self, obj):
        return f"{obj.talent.first_name} {obj.talent.last_name}"
    talent_name.short_description = 'Talent'
    
    def agenda_name(self, obj):
        return obj.calendar_slot.agenda.name
    agenda_name.short_description = 'Agenda'
    
    def appointment_date(self, obj):
        return obj.calendar_slot.slot_date
    appointment_date.short_description = 'Date'
    
    def appointment_time(self, obj):
        return f"{obj.calendar_slot.start_time} - {obj.calendar_slot.end_time}"
    appointment_time.short_description = 'Time'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'talent', 'calendar_slot__agenda'
        )

@admin.register(AppointmentStatistics)
class AppointmentStatisticsAdmin(admin.ModelAdmin):
    list_display = ('university', 'theme', 'staff_name', 'date', 'total_slots', 
                   'booked_slots', 'completed_appointments', 'average_rating')
    list_filter = ('date', 'university', 'theme')
    search_fields = ('university__name', 'theme__name', 'staff__user__first_name', 'staff__user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    def staff_name(self, obj):
        if obj.staff:
            return f"{obj.staff.user.first_name} {obj.staff.user.last_name}"
        return '-'
    staff_name.short_description = 'Staff Member'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'university', 'theme', 'staff__user'
        )

@admin.register(EmailReminder)
class EmailReminderAdmin(admin.ModelAdmin):
    list_display = ('appointment_ref', 'reminder_type', 'recipient_email', 'status', 'sent_at')
    list_filter = ('reminder_type', 'status', 'sent_at')
    search_fields = ('appointment__booking_reference', 'recipient_email', 'subject')
    readonly_fields = ('sent_at', 'created_at')
    date_hierarchy = 'sent_at'
    
    fieldsets = (
        ('Reminder Details', {
            'fields': ('appointment', 'reminder_type', 'recipient_email')
        }),
        ('Email Content', {
            'fields': ('subject',)
        }),
        ('Status', {
            'fields': ('status', 'error_message', 'email_provider_id')
        }),
        ('Timestamps', {
            'fields': ('sent_at', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def appointment_ref(self, obj):
        return obj.appointment.booking_reference
    appointment_ref.short_description = 'Appointment'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment')

@admin.register(AgendaStaffAssignment)
class AgendaStaffAssignmentAdmin(admin.ModelAdmin):
    list_display = ('agenda', 'staff_name', 'role', 'is_primary', 'created_at')
    list_filter = ('role', 'is_primary', 'agenda__university')
    search_fields = ('agenda__name', 'staff__user__first_name', 'staff__user__last_name')
    
    def staff_name(self, obj):
        return f"{obj.staff.user.first_name} {obj.staff.user.last_name}"
    staff_name.short_description = 'Staff Member'

@admin.register(TalentEligibilityCriteria)
class TalentEligibilityCriteriaAdmin(admin.ModelAdmin):
    list_display = ('agenda', 'criteria_type', 'criteria_value', 'is_required', 'created_at')
    list_filter = ('criteria_type', 'is_required', 'agenda__university')
    search_fields = ('agenda__name', 'criteria_value')

@admin.register(AppointmentAttachment)
class AppointmentAttachmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_ref', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('appointment__booking_reference', 'file_name', 'uploaded_by__username')
    readonly_fields = ('uploaded_at',)
    
    def appointment_ref(self, obj):
        return obj.appointment.booking_reference
    appointment_ref.short_description = 'Appointment'

