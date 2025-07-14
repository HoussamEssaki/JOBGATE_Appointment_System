from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    AppointmentTheme, Agenda, CalendarSlot, Appointment,
    AppointmentStatistics, EmailReminder, AgendaStaffAssignment,
    TalentEligibilityCriteria, AppointmentAttachment
)
from universities.serializers import UniversitySerializer, UniversityStaffSerializer
from users.serializers import UserSerializer

class AppointmentThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentTheme
        fields = ['id', 'name', 'description', 'color_code', 'icon', 'is_active']

class TalentEligibilityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentEligibilityCriteria
        fields = ['id', 'criteria_type', 'criteria_value', 'is_required']

class AgendaStaffAssignmentSerializer(serializers.ModelSerializer):
    staff = UniversityStaffSerializer(read_only=True)
    
    class Meta:
        model = AgendaStaffAssignment
        fields = ['id', 'staff', 'role', 'is_primary']

class AgendaSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    created_by = UniversityStaffSerializer(read_only=True)
    theme = AppointmentThemeSerializer(read_only=True)
    eligibility_criteria = TalentEligibilityCriteriaSerializer(many=True, read_only=True)
    staff_assignments = AgendaStaffAssignmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Agenda
        fields = ['id', 'university', 'created_by', 'name', 'description', 'theme',
                 'slot_duration_minutes', 'max_capacity_per_slot', 'start_date', 'end_date',
                 'is_recurring', 'recurrence_pattern', 'booking_deadline_hours',
                 'cancellation_deadline_hours', 'is_active', 'created_at', 'updated_at',
                 'eligibility_criteria', 'staff_assignments']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AgendaCreateSerializer(serializers.ModelSerializer):
    theme_id = serializers.IntegerField()
    eligibility_criteria = TalentEligibilityCriteriaSerializer(many=True, required=False)
    
    class Meta:
        model = Agenda
        fields = ['name', 'description', 'theme_id', 'slot_duration_minutes',
                 'max_capacity_per_slot', 'start_date', 'end_date', 'is_recurring',
                 'recurrence_pattern', 'booking_deadline_hours', 'cancellation_deadline_hours',
                 'eligibility_criteria']
    
    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return attrs
    
    def create(self, validated_data):
        eligibility_criteria_data = validated_data.pop('eligibility_criteria', [])
        theme_id = validated_data.pop('theme_id')
        
        # Get theme
        try:
            theme = AppointmentTheme.objects.get(id=theme_id)
        except AppointmentTheme.DoesNotExist:
            raise serializers.ValidationError("Invalid theme ID")
        
        agenda = Agenda.objects.create(theme=theme, **validated_data)
        
        # Create eligibility criteria
        for criteria_data in eligibility_criteria_data:
            TalentEligibilityCriteria.objects.create(agenda=agenda, **criteria_data)
        
        return agenda

class CalendarSlotSerializer(serializers.ModelSerializer):
    agenda = AgendaSerializer(read_only=True)
    staff = UniversityStaffSerializer(read_only=True)
    available_capacity = serializers.SerializerMethodField()
    
    class Meta:
        model = CalendarSlot
        fields = ['id', 'agenda', 'staff', 'slot_date', 'start_time', 'end_time',
                 'max_capacity', 'current_bookings', 'available_capacity', 'status',
                 'notes', 'location', 'meeting_type', 'meeting_link', 'created_at', 'updated_at']
        read_only_fields = ['id', 'current_bookings', 'created_at', 'updated_at']
    
    def get_available_capacity(self, obj):
        return obj.max_capacity - obj.current_bookings

class CalendarSlotCreateSerializer(serializers.ModelSerializer):
    agenda_id = serializers.IntegerField()
    staff_id = serializers.IntegerField()
    
    class Meta:
        model = CalendarSlot
        fields = ['agenda_id', 'staff_id', 'slot_date', 'start_time', 'end_time',
                 'max_capacity', 'notes', 'location', 'meeting_type', 'meeting_link']
    
    def validate(self, attrs):
        if attrs['end_time'] <= attrs['start_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        # Check for overlapping slots for the same staff
        staff_id = attrs['staff_id']
        slot_date = attrs['slot_date']
        start_time = attrs['start_time']
        end_time = attrs['end_time']
        
        overlapping_slots = CalendarSlot.objects.filter(
            staff_id=staff_id,
            slot_date=slot_date,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        if self.instance:
            overlapping_slots = overlapping_slots.exclude(id=self.instance.id)
        
        if overlapping_slots.exists():
            raise serializers.ValidationError("This time slot overlaps with an existing slot")
        
        return attrs

class AppointmentSerializer(serializers.ModelSerializer):
    calendar_slot = CalendarSlotSerializer(read_only=True)
    talent = UserSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'calendar_slot', 'talent', 'booking_reference', 'status',
                 'talent_notes', 'staff_notes', 'rating', 'feedback',
                 'reminder_sent_24h', 'reminder_sent_1h', 'confirmation_sent',
                 'booked_at', 'cancelled_at', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'booking_reference', 'booked_at', 'created_at', 'updated_at']

class AppointmentBookingSerializer(serializers.ModelSerializer):
    calendar_slot_id = serializers.IntegerField()
    
    class Meta:
        model = Appointment
        fields = ['calendar_slot_id', 'talent_notes']
    
    def validate_calendar_slot_id(self, value):
        try:
            slot = CalendarSlot.objects.get(id=value)
        except CalendarSlot.DoesNotExist:
            raise serializers.ValidationError("Invalid calendar slot")
        
        if slot.status != 'available':
            raise serializers.ValidationError("This slot is not available")
        
        if slot.current_bookings >= slot.max_capacity:
            raise serializers.ValidationError("This slot is fully booked")
        
        # Check booking deadline
        slot_datetime = datetime.combine(slot.slot_date, slot.start_time)
        booking_deadline = slot_datetime - timedelta(hours=slot.agenda.booking_deadline_hours)
        
        if timezone.now() > timezone.make_aware(booking_deadline):
            raise serializers.ValidationError("Booking deadline has passed")
        
        return value
    
    def create(self, validated_data):
        calendar_slot_id = validated_data.pop('calendar_slot_id')
        slot = CalendarSlot.objects.get(id=calendar_slot_id)
        
        appointment = Appointment.objects.create(
            calendar_slot=slot,
            **validated_data
        )
        
        # Update slot booking count
        slot.current_bookings += 1
        if slot.current_bookings >= slot.max_capacity:
            slot.status = 'fully_booked'
        slot.save()
        
        return appointment

class AppointmentStatisticsSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    theme = AppointmentThemeSerializer(read_only=True)
    staff = UniversityStaffSerializer(read_only=True)
    
    class Meta:
        model = AppointmentStatistics
        fields = ['id', 'university', 'theme', 'staff', 'date', 'total_slots',
                 'booked_slots', 'completed_appointments', 'cancelled_appointments',
                 'no_show_appointments', 'total_duration_minutes', 'unique_talents_count',
                 'average_rating', 'created_at', 'updated_at']

class EmailReminderSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)
    
    class Meta:
        model = EmailReminder
        fields = ['id', 'appointment', 'reminder_type', 'recipient_email', 'subject',
                 'sent_at', 'status', 'error_message', 'email_provider_id', 'created_at']

class AppointmentAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AppointmentAttachment
        fields = ['id', 'file_name', 'file_path', 'file_size', 'file_type',
                 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

