# FileName: MultipleFiles/models.py (appointments app)
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# Import the correct models from universities and users
from universities.models import UniversityProfile # Import UniversityProfile
from users.models import User # Import User model

class AppointmentTheme(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color_code = models.CharField(max_length=7, blank=True, null=True)  # Hex color
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'appointment_themes'

class Agenda(models.Model):
    # Changed from universities.University to universities.UniversityProfile
    university = models.ForeignKey(UniversityProfile, on_delete=models.CASCADE, related_name='agendas')
    # Changed from universities.UniversityStaff to users.User
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_agendas')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    theme = models.ForeignKey(AppointmentTheme, on_delete=models.CASCADE, related_name='agendas')
    slot_duration_minutes = models.PositiveIntegerField(default=30, validators=[MinValueValidator(1)])
    max_capacity_per_slot = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    start_date = models.DateField()
    end_date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.JSONField(default=dict, blank=True)
    booking_deadline_hours = models.PositiveIntegerField(default=24)
    cancellation_deadline_hours = models.PositiveIntegerField(default=24)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.university.display_name}" # Adjusted for UniversityProfile

    class Meta:
        db_table = 'agendas'
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gte=models.F('start_date')),
                name='valid_date_range'
            )
        ]

class CalendarSlot(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('fully_booked', 'Fully Booked'),
        ('cancelled', 'Cancelled'),
        ('blocked', 'Blocked'),
    ]

    MEETING_TYPE_CHOICES = [
        ('in_person', 'In Person'),
        ('online', 'Online'),
        ('phone', 'Phone'),
    ]

    agenda = models.ForeignKey(Agenda, on_delete=models.CASCADE, related_name='calendar_slots')
    # Changed from universities.UniversityStaff to users.User
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_slots')
    slot_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_capacity = models.PositiveIntegerField(default=1)
    current_bookings = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    notes = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPE_CHOICES, default='in_person')
    meeting_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.agenda.name} - {self.slot_date} {self.start_time}"

    class Meta:
        db_table = 'calendar_slots'
        unique_together = ['agenda', 'staff', 'slot_date', 'start_time']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='valid_time_range'
            ),
            models.CheckConstraint(
                check=models.Q(current_bookings__lte=models.F('max_capacity')),
                name='valid_capacity'
            )
        ]

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]

    calendar_slot = models.ForeignKey(CalendarSlot, on_delete=models.CASCADE, related_name='appointments')
    talent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    booking_reference = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    talent_notes = models.TextField(blank=True, null=True)
    staff_notes = models.TextField(blank=True, null=True)
    rating = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    feedback = models.TextField(blank=True, null=True)
    reminder_sent_24h = models.BooleanField(default=False)
    reminder_sent_1h = models.BooleanField(default=False)
    confirmation_sent = models.BooleanField(default=False)
    booked_at = models.DateTimeField(default=timezone.now)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.booking_reference} - {self.talent.email}"

    class Meta:
        db_table = 'appointments'

class AppointmentStatistics(models.Model):
    # Changed from universities.University to universities.UniversityProfile
    university = models.ForeignKey(UniversityProfile, on_delete=models.CASCADE, related_name='statistics')
    theme = models.ForeignKey(AppointmentTheme, on_delete=models.CASCADE, related_name='statistics')
    # Changed from universities.UniversityStaff to users.User
    staff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='statistics')
    date = models.DateField()
    total_slots = models.PositiveIntegerField(default=0)
    booked_slots = models.PositiveIntegerField(default=0)
    completed_appointments = models.PositiveIntegerField(default=0)
    cancelled_appointments = models.PositiveIntegerField(default=0)
    no_show_appointments = models.PositiveIntegerField(default=0)
    total_duration_minutes = models.PositiveIntegerField(default=0)
    unique_talents_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stats for {self.university.display_name} - {self.date}" # Adjusted for UniversityProfile

    class Meta:
        db_table = 'appointment_statistics'
        unique_together = ['university', 'theme', 'staff', 'date']

class EmailReminder(models.Model):
    REMINDER_TYPE_CHOICES = [
        ('confirmation', 'Confirmation'),
        ('24_hour', '24 Hour Reminder'),
        ('1_hour', '1 Hour Reminder'),
        ('cancellation', 'Cancellation'),
        ('follow_up', 'Follow Up'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ]

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='email_reminders')
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPE_CHOICES)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    sent_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    error_message = models.TextField(blank=True, null=True)
    email_provider_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.reminder_type} for {self.appointment.booking_reference}"

    class Meta:
        db_table = 'email_reminders'

class AgendaStaffAssignment(models.Model):
    ROLE_CHOICES = [
        ('advisor', 'Advisor'),
        ('coordinator', 'Coordinator'),
        ('assistant', 'Assistant'),
    ]

    agenda = models.ForeignKey(Agenda, on_delete=models.CASCADE, related_name='staff_assignments')
    # Changed from universities.UniversityStaff to users.User
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agenda_assignments')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='advisor')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.staff.first_name} {self.staff.last_name} - {self.agenda.name}" # Adjusted for User

    class Meta:
        db_table = 'agenda_staff_assignments'
        unique_together = ['agenda', 'staff']

class TalentEligibilityCriteria(models.Model):
    CRITERIA_TYPE_CHOICES = [
        ('university', 'University'),
        ('year_of_study', 'Year of Study'),
        ('field_of_study', 'Field of Study'),
        ('gpa_minimum', 'Minimum GPA'),
    ]

    agenda = models.ForeignKey(Agenda, on_delete=models.CASCADE, related_name='eligibility_criteria')
    criteria_type = models.CharField(max_length=50, choices=CRITERIA_TYPE_CHOICES)
    criteria_value = models.CharField(max_length=255)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.agenda.name} - {self.criteria_type}: {self.criteria_value}"

    class Meta:
        db_table = 'talent_eligibility_criteria'

class AppointmentAttachment(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='attachments')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.PositiveIntegerField(blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.file_name} - {self.appointment.booking_reference}"

    class Meta:
        db_table = 'appointment_attachments'
