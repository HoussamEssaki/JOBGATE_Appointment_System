# FileName: MultipleFiles/tasks.py (appointments app)
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
from datetime import datetime, timedelta
from .models import Appointment, EmailReminder
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_appointment_confirmation(appointment_id):
    """Send appointment confirmation email"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)

        if appointment.confirmation_sent:
            logger.info(f"Confirmation already sent for appointment {appointment.booking_reference}")
            return

        subject = f"Appointment Confirmation - {appointment.booking_reference}"

        # Create email content
        context = {
            'appointment': appointment,
            'talent': appointment.talent,
            'slot': appointment.calendar_slot,
            'agenda': appointment.calendar_slot.agenda,
            'university_profile': appointment.calendar_slot.agenda.university, # Now UniversityProfile
        }

        message = f"""
Dear {appointment.talent.first_name} {appointment.talent.last_name},

Your appointment has been confirmed!

Appointment Details:
- Reference: {appointment.booking_reference}
- Agenda: {appointment.calendar_slot.agenda.name}
- Date: {appointment.calendar_slot.slot_date}
- Time: {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}
- Location: {appointment.calendar_slot.location or 'TBD'}
- Meeting Type: {appointment.calendar_slot.get_meeting_type_display()}

University: {appointment.calendar_slot.agenda.university.display_name} # Adjusted for UniversityProfile

If you need to cancel or reschedule, please contact us at least {appointment.calendar_slot.agenda.cancellation_deadline_hours} hours before your appointment.

Best regards,
JOBGATE Team
        """

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.talent.email],
            fail_silently=False,
        )

        # Mark as sent
        appointment.confirmation_sent = True
        appointment.save()

        # Log the email
        EmailReminder.objects.create(
            appointment=appointment,
            reminder_type='confirmation',
            recipient_email=appointment.talent.email,
            subject=subject,
            status='sent'
        )

        logger.info(f"Confirmation email sent for appointment {appointment.booking_reference}")

    except Appointment.DoesNotExist:
        logger.error(f"Appointment {appointment_id} not found")
    except Exception as e:
        logger.error(f"Failed to send confirmation email for appointment {appointment_id}: {str(e)}")

@shared_task
def send_appointment_reminders():
    """Send appointment reminders (24h and 1h before)"""
    now = timezone.now()

    # 24-hour reminders
    reminder_24h_time = now + timedelta(hours=24)
    appointments_24h = Appointment.objects.filter(
        status='confirmed',
        reminder_sent_24h=False,
        calendar_slot__slot_date=reminder_24h_time.date(),
        calendar_slot__start_time__hour=reminder_24h_time.hour
    )

    for appointment in appointments_24h:
        send_24h_reminder.delay(appointment.id)

    # 1-hour reminders
    reminder_1h_time = now + timedelta(hours=1)
    appointments_1h = Appointment.objects.filter(
        status='confirmed',
        reminder_sent_1h=False,
        calendar_slot__slot_date=reminder_1h_time.date(),
        calendar_slot__start_time__hour=reminder_1h_time.hour,
        calendar_slot__start_time__minute__lte=reminder_1h_time.minute + 5  # 5-minute window
    )

    for appointment in appointments_1h:
        send_1h_reminder.delay(appointment.id)

@shared_task
def send_24h_reminder(appointment_id):
    """Send 24-hour reminder email"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)

        if appointment.reminder_sent_24h:
            return

        subject = f"Reminder: Appointment Tomorrow - {appointment.booking_reference}"

        message = f"""
Dear {appointment.talent.first_name} {appointment.talent.last_name},

This is a reminder that you have an appointment scheduled for tomorrow.

Appointment Details:
- Reference: {appointment.booking_reference}
- Agenda: {appointment.calendar_slot.agenda.name}
- Date: {appointment.calendar_slot.slot_date}
- Time: {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}
- Location: {appointment.calendar_slot.location or 'TBD'}
- Meeting Type: {appointment.calendar_slot.get_meeting_type_display()}

{f"Meeting Link: {appointment.calendar_slot.meeting_link}" if appointment.calendar_slot.meeting_link else ""}

Please make sure to arrive on time. If you need to cancel, please do so at least {appointment.calendar_slot.agenda.cancellation_deadline_hours} hours before your appointment.

Best regards,
JOBGATE Team
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.talent.email],
            fail_silently=False,
        )

        appointment.reminder_sent_24h = True
        appointment.save()

        EmailReminder.objects.create(
            appointment=appointment,
            reminder_type='24_hour',
            recipient_email=appointment.talent.email,
            subject=subject,
            status='sent'
        )

        logger.info(f"24h reminder sent for appointment {appointment.booking_reference}")

    except Exception as e:
        logger.error(f"Failed to send 24h reminder for appointment {appointment_id}: {str(e)}")

@shared_task
def send_1h_reminder(appointment_id):
    """Send 1-hour reminder email"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)

        if appointment.reminder_sent_1h:
            return

        subject = f"Reminder: Appointment in 1 Hour - {appointment.booking_reference}"

        message = f"""
Dear {appointment.talent.first_name} {appointment.talent.last_name},

This is a reminder that you have an appointment in 1 hour.

Appointment Details:
- Reference: {appointment.booking_reference}
- Agenda: {appointment.calendar_slot.agenda.name}
- Date: {appointment.calendar_slot.slot_date}
- Time: {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}
- Location: {appointment.calendar_slot.location or 'TBD'}
- Meeting Type: {appointment.calendar_slot.get_meeting_type_display()}

{f"Meeting Link: {appointment.calendar_slot.meeting_link}" if appointment.calendar_slot.meeting_link else ""}

Please make sure to arrive on time.

Best regards,
JOBGATE Team
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.talent.email],
            fail_silently=False,
        )

        appointment.reminder_sent_1h = True
        appointment.save()

        EmailReminder.objects.create(
            appointment=appointment,
            reminder_type='1_hour',
            recipient_email=appointment.talent.email,
            subject=subject,
            status='sent'
        )

        logger.info(f"1h reminder sent for appointment {appointment.booking_reference}")

    except Exception as e:
        logger.error(f"Failed to send 1h reminder for appointment {appointment_id}: {str(e)}")

@shared_task
def send_cancellation_email(appointment_id, cancelled_by_staff=False):
    """Send appointment cancellation email"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)

        subject = f"Appointment Cancelled - {appointment.booking_reference}"

        if cancelled_by_staff:
            message = f"""
Dear {appointment.talent.first_name} {appointment.talent.last_name},

We regret to inform you that your appointment has been cancelled by the university staff.

Cancelled Appointment Details:
- Reference: {appointment.booking_reference}
- Agenda: {appointment.calendar_slot.agenda.name}
- Date: {appointment.calendar_slot.slot_date}
- Time: {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}

Please contact us to reschedule your appointment.

We apologize for any inconvenience caused.

Best regards,
JOBGATE Team
            """
        else:
            message = f"""
Dear {appointment.talent.first_name} {appointment.talent.last_name},

Your appointment cancellation has been confirmed.

Cancelled Appointment Details:
- Reference: {appointment.booking_reference}
- Agenda: {appointment.calendar_slot.agenda.name}
- Date: {appointment.calendar_slot.slot_date}
- Time: {appointment.calendar_slot.start_time} - {appointment.calendar_slot.end_time}

You can book a new appointment anytime through our platform.

Best regards,
JOBGATE Team
            """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.talent.email],
            fail_silently=False,
        )

        EmailReminder.objects.create(
            appointment=appointment,
            reminder_type='cancellation',
            recipient_email=appointment.talent.email,
            subject=subject,
            status='sent'
        )

        logger.info(f"Cancellation email sent for appointment {appointment.booking_reference}")

    except Exception as e:
        logger.error(f"Failed to send cancellation email for appointment {appointment_id}: {str(e)}")

@shared_task
def calculate_daily_statistics():
    """Calculate daily statistics for all universities"""
    from django.db import connection

    try:
        # This stored procedure might need to be updated to reflect UniversityProfile
        # If it relies on the old University model, it will fail.
        # You might need to rewrite this logic in Python or update the SQL function.
        with connection.cursor() as cursor:
            cursor.execute("SELECT calculate_daily_statistics(%s)", [timezone.now().date()])

        logger.info("Daily statistics calculated successfully")

    except Exception as e:
        logger.error(f"Failed to calculate daily statistics: {str(e)}")

@shared_task
def cleanup_old_audit_logs():
    """Clean up audit logs older than 90 days"""
    try:
        from django.db import connection

        cutoff_date = timezone.now() - timedelta(days=90)

        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM audit_logs WHERE created_at < %s",
                [cutoff_date]
            )
            deleted_count = cursor.rowcount

        logger.info(f"Cleaned up {deleted_count} old audit log entries")

    except Exception as e:
        logger.error(f"Failed to cleanup old audit logs: {str(e)}")
