"""
Email templates for appointment notifications
"""

def get_appointment_confirmation_template(appointment):
    """
    Generate email template for appointment confirmation
    """
    slot = appointment.calendar_slot
    agenda = slot.agenda
    university = agenda.university
    
    subject = f"Appointment Confirmed - {agenda.name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Appointment Confirmation</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
            .appointment-details {{ background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
            .button {{ display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmed</h1>
                <p>Your appointment has been successfully booked!</p>
            </div>
            
            <p>Dear {appointment.talent.first_name} {appointment.talent.last_name},</p>
            
            <p>This email confirms your appointment booking with {university.name}.</p>
            
            <div class="appointment-details">
                <h3>Appointment Details</h3>
                <p><strong>Agenda:</strong> {agenda.name}</p>
                <p><strong>Date:</strong> {slot.slot_date.strftime('%A, %B %d, %Y')}</p>
                <p><strong>Time:</strong> {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}</p>
                <p><strong>Duration:</strong> {agenda.slot_duration_minutes} minutes</p>
                <p><strong>Meeting Type:</strong> {slot.get_meeting_type_display()}</p>
                {f'<p><strong>Location:</strong> {slot.location}</p>' if slot.location else ''}
                {f'<p><strong>Meeting Link:</strong> <a href="{slot.meeting_link}">{slot.meeting_link}</a></p>' if slot.meeting_link else ''}
                <p><strong>Booking Reference:</strong> {appointment.booking_reference}</p>
            </div>
            
            {f'<p><strong>Your Notes:</strong> {appointment.talent_notes}</p>' if appointment.talent_notes else ''}
            
            <h3>Important Information</h3>
            <ul>
                <li>Please arrive on time for your appointment</li>
                <li>You can cancel this appointment up to {agenda.cancellation_deadline_hours} hours before the scheduled time</li>
                <li>If you need to reschedule, please cancel this appointment and book a new one</li>
                {f'<li>For online meetings, please test your connection beforehand</li>' if slot.meeting_type == 'online' else ''}
            </ul>
            
            <p>If you have any questions, please contact {university.name} directly.</p>
            
            <div class="footer">
                <p>This is an automated message from the JOBGATE Appointment System.</p>
                <p>{university.name} | {university.address if hasattr(university, 'address') else ''}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Appointment Confirmed
    
    Dear {appointment.talent.first_name} {appointment.talent.last_name},
    
    This email confirms your appointment booking with {university.name}.
    
    Appointment Details:
    - Agenda: {agenda.name}
    - Date: {slot.slot_date.strftime('%A, %B %d, %Y')}
    - Time: {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}
    - Duration: {agenda.slot_duration_minutes} minutes
    - Meeting Type: {slot.get_meeting_type_display()}
    {f'- Location: {slot.location}' if slot.location else ''}
    {f'- Meeting Link: {slot.meeting_link}' if slot.meeting_link else ''}
    - Booking Reference: {appointment.booking_reference}
    
    {f'Your Notes: {appointment.talent_notes}' if appointment.talent_notes else ''}
    
    Important Information:
    - Please arrive on time for your appointment
    - You can cancel this appointment up to {agenda.cancellation_deadline_hours} hours before the scheduled time
    - If you need to reschedule, please cancel this appointment and book a new one
    {f'- For online meetings, please test your connection beforehand' if slot.meeting_type == 'online' else ''}
    
    If you have any questions, please contact {university.name} directly.
    
    This is an automated message from the JOBGATE Appointment System.
    """
    
    return {
        'subject': subject,
        'html_content': html_content,
        'text_content': text_content,
        'to_email': appointment.talent.email,
        'to_name': f"{appointment.talent.first_name} {appointment.talent.last_name}"
    }

def get_appointment_cancellation_template(appointment, cancelled_by_staff=False):
    """
    Generate email template for appointment cancellation
    """
    slot = appointment.calendar_slot
    agenda = slot.agenda
    university = agenda.university
    
    subject = f"Appointment Cancelled - {agenda.name}"
    
    cancellation_reason = "by the university staff" if cancelled_by_staff else "by you"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Appointment Cancelled</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
            .appointment-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
            .button {{ display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
                <p>Your appointment has been cancelled {cancellation_reason}.</p>
            </div>
            
            <p>Dear {appointment.talent.first_name} {appointment.talent.last_name},</p>
            
            <p>This email confirms that your appointment with {university.name} has been cancelled.</p>
            
            <div class="appointment-details">
                <h3>Cancelled Appointment Details</h3>
                <p><strong>Agenda:</strong> {agenda.name}</p>
                <p><strong>Date:</strong> {slot.slot_date.strftime('%A, %B %d, %Y')}</p>
                <p><strong>Time:</strong> {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}</p>
                <p><strong>Booking Reference:</strong> {appointment.booking_reference}</p>
                <p><strong>Cancelled At:</strong> {appointment.cancelled_at.strftime('%A, %B %d, %Y at %I:%M %p') if appointment.cancelled_at else 'N/A'}</p>
            </div>
            
            {f'<p><strong>Cancellation Reason:</strong> {appointment.cancellation_reason}</p>' if hasattr(appointment, 'cancellation_reason') and appointment.cancellation_reason else ''}
            
            <p>You can book a new appointment at any time by visiting the JOBGATE platform.</p>
            
            <p>If you have any questions about this cancellation, please contact {university.name} directly.</p>
            
            <div class="footer">
                <p>This is an automated message from the JOBGATE Appointment System.</p>
                <p>{university.name} | {university.address if hasattr(university, 'address') else ''}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Appointment Cancelled
    
    Dear {appointment.talent.first_name} {appointment.talent.last_name},
    
    This email confirms that your appointment with {university.name} has been cancelled {cancellation_reason}.
    
    Cancelled Appointment Details:
    - Agenda: {agenda.name}
    - Date: {slot.slot_date.strftime('%A, %B %d, %Y')}
    - Time: {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}
    - Booking Reference: {appointment.booking_reference}
    - Cancelled At: {appointment.cancelled_at.strftime('%A, %B %d, %Y at %I:%M %p') if appointment.cancelled_at else 'N/A'}
    
    {f'Cancellation Reason: {appointment.cancellation_reason}' if hasattr(appointment, 'cancellation_reason') and appointment.cancellation_reason else ''}
    
    You can book a new appointment at any time by visiting the JOBGATE platform.
    
    If you have any questions about this cancellation, please contact {university.name} directly.
    
    This is an automated message from the JOBGATE Appointment System.
    """
    
    return {
        'subject': subject,
        'html_content': html_content,
        'text_content': text_content,
        'to_email': appointment.talent.email,
        'to_name': f"{appointment.talent.first_name} {appointment.talent.last_name}"
    }

def get_appointment_reminder_template(appointment, hours_before):
    """
    Generate email template for appointment reminder
    """
    slot = appointment.calendar_slot
    agenda = slot.agenda
    university = agenda.university
    
    subject = f"Reminder: Upcoming Appointment - {agenda.name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Appointment Reminder</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
            .appointment-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
            .urgent {{ background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Reminder</h1>
                <p>Your appointment is coming up in {hours_before} hours!</p>
            </div>
            
            <p>Dear {appointment.talent.first_name} {appointment.talent.last_name},</p>
            
            <p>This is a friendly reminder about your upcoming appointment with {university.name}.</p>
            
            <div class="appointment-details">
                <h3>Appointment Details</h3>
                <p><strong>Agenda:</strong> {agenda.name}</p>
                <p><strong>Date:</strong> {slot.slot_date.strftime('%A, %B %d, %Y')}</p>
                <p><strong>Time:</strong> {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}</p>
                <p><strong>Duration:</strong> {agenda.slot_duration_minutes} minutes</p>
                <p><strong>Meeting Type:</strong> {slot.get_meeting_type_display()}</p>
                {f'<p><strong>Location:</strong> {slot.location}</p>' if slot.location else ''}
                {f'<p><strong>Meeting Link:</strong> <a href="{slot.meeting_link}">Join Meeting</a></p>' if slot.meeting_link else ''}
                <p><strong>Booking Reference:</strong> {appointment.booking_reference}</p>
            </div>
            
            {f'<p><strong>Your Notes:</strong> {appointment.talent_notes}</p>' if appointment.talent_notes else ''}
            
            <div class="urgent">
                <h3>Preparation Checklist</h3>
                <ul>
                    <li>Please arrive on time for your appointment</li>
                    {f'<li>Test your internet connection and camera/microphone</li>' if slot.meeting_type == 'online' else ''}
                    {f'<li>Have the meeting link ready: <a href="{slot.meeting_link}">{slot.meeting_link}</a></li>' if slot.meeting_link else ''}
                    {f'<li>Know the location: {slot.location}</li>' if slot.location else ''}
                    <li>Prepare any questions you want to discuss</li>
                    <li>Have your resume or relevant documents ready</li>
                </ul>
            </div>
            
            <p>If you need to cancel, please do so as soon as possible. You can cancel up to {agenda.cancellation_deadline_hours} hours before the appointment.</p>
            
            <div class="footer">
                <p>This is an automated reminder from the JOBGATE Appointment System.</p>
                <p>{university.name} | {university.address if hasattr(university, 'address') else ''}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Appointment Reminder
    
    Dear {appointment.talent.first_name} {appointment.talent.last_name},
    
    This is a friendly reminder about your upcoming appointment with {university.name} in {hours_before} hours.
    
    Appointment Details:
    - Agenda: {agenda.name}
    - Date: {slot.slot_date.strftime('%A, %B %d, %Y')}
    - Time: {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}
    - Duration: {agenda.slot_duration_minutes} minutes
    - Meeting Type: {slot.get_meeting_type_display()}
    {f'- Location: {slot.location}' if slot.location else ''}
    {f'- Meeting Link: {slot.meeting_link}' if slot.meeting_link else ''}
    - Booking Reference: {appointment.booking_reference}
    
    {f'Your Notes: {appointment.talent_notes}' if appointment.talent_notes else ''}
    
    Preparation Checklist:
    - Please arrive on time for your appointment
    {f'- Test your internet connection and camera/microphone' if slot.meeting_type == 'online' else ''}
    {f'- Have the meeting link ready: {slot.meeting_link}' if slot.meeting_link else ''}
    {f'- Know the location: {slot.location}' if slot.location else ''}
    - Prepare any questions you want to discuss
    - Have your resume or relevant documents ready
    
    If you need to cancel, please do so as soon as possible. You can cancel up to {agenda.cancellation_deadline_hours} hours before the appointment.
    
    This is an automated reminder from the JOBGATE Appointment System.
    """
    
    return {
        'subject': subject,
        'html_content': html_content,
        'text_content': text_content,
        'to_email': appointment.talent.email,
        'to_name': f"{appointment.talent.first_name} {appointment.talent.last_name}"
    }

def get_staff_notification_template(appointment, notification_type):
    """
    Generate email template for staff notifications
    """
    slot = appointment.calendar_slot
    agenda = slot.agenda
    university = agenda.university
    staff = slot.staff
    
    if notification_type == 'new_booking':
        subject = f"New Appointment Booked - {agenda.name}"
        action = "booked"
    elif notification_type == 'cancellation':
        subject = f"Appointment Cancelled - {agenda.name}"
        action = "cancelled"
    else:
        subject = f"Appointment Update - {agenda.name}"
        action = "updated"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Staff Notification</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
            .appointment-details {{ background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment {action.title()}</h1>
                <p>An appointment has been {action} for your agenda.</p>
            </div>
            
            <p>Dear {staff.user.first_name} {staff.user.last_name},</p>
            
            <p>An appointment for your "{agenda.name}" agenda has been {action}.</p>
            
            <div class="appointment-details">
                <h3>Appointment Details</h3>
                <p><strong>Talent:</strong> {appointment.talent.first_name} {appointment.talent.last_name}</p>
                <p><strong>Email:</strong> {appointment.talent.email}</p>
                <p><strong>Date:</strong> {slot.slot_date.strftime('%A, %B %d, %Y')}</p>
                <p><strong>Time:</strong> {slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}</p>
                <p><strong>Meeting Type:</strong> {slot.get_meeting_type_display()}</p>
                {f'<p><strong>Location:</strong> {slot.location}</p>' if slot.location else ''}
                <p><strong>Booking Reference:</strong> {appointment.booking_reference}</p>
            </div>
            
            {f'<p><strong>Talent Notes:</strong> {appointment.talent_notes}</p>' if appointment.talent_notes else ''}
            
            <p>Please log into the JOBGATE system to view more details or manage your appointments.</p>
            
            <div class="footer">
                <p>This is an automated notification from the JOBGATE Appointment System.</p>
                <p>{university.name}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return {
        'subject': subject,
        'html_content': html_content,
        'to_email': staff.user.email,
        'to_name': f"{staff.user.first_name} {staff.user.last_name}"
    }

