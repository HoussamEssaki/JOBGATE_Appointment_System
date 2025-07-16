# FileName: MultipleFiles/views.py (appointments app)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from datetime import datetime, timedelta
from .models import (
    AppointmentTheme, Agenda, CalendarSlot, Appointment,
    AppointmentStatistics, EmailReminder, AgendaStaffAssignment
)
from .serializers import (
    AppointmentThemeSerializer, AgendaSerializer, AgendaCreateSerializer,
    CalendarSlotSerializer, CalendarSlotCreateSerializer,
    AppointmentSerializer, AppointmentBookingSerializer,
    AppointmentStatisticsSerializer, EmailReminderSerializer
)
# Removed: from universities.models import UniversityStaff
from universities.models import UniversityProfile # Import UniversityProfile

# Appointment Themes
class AppointmentThemeListView(generics.ListAPIView):
    queryset = AppointmentTheme.objects.filter(is_active=True)
    serializer_class = AppointmentThemeSerializer
    permission_classes = [permissions.IsAuthenticated]

# Agendas
class AgendaListCreateView(generics.ListCreateAPIView):
    serializer_class = AgendaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Agenda.objects.filter(is_active=True).select_related(
            'university', 'created_by', 'theme' # created_by is now User
        ).prefetch_related('eligibility_criteria', 'staff_assignments')

        # Filter by university if provided (now UniversityProfile ID)
        university_profile_id = self.request.query_params.get('university_profile_id')
        if university_profile_id:
            queryset = queryset.filter(university_id=university_profile_id)

        # Filter by theme if provided
        theme_id = self.request.query_params.get('theme_id')
        if theme_id:
            queryset = queryset.filter(theme_id=theme_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AgendaCreateSerializer
        return AgendaSerializer

    def perform_create(self, serializer):
        # Get the UniversityProfile for the current user
        try:
            # Assuming a user with user_type 'university_staff' has a UniversityProfile
            # linked via a OneToOneField with related_name='university_profile'
            university_profile = self.request.user.university_profile
            # The created_by is the user themselves
            serializer.save(university=university_profile, created_by=self.request.user)
        except UniversityProfile.DoesNotExist:
            return Response({"error": "University staff profile not found for this user."}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError: # If user.university_profile doesn't exist
            return Response({"error": "Only university staff can create agendas."}, status=status.HTTP_403_FORBIDDEN)


class AgendaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agenda.objects.filter(is_active=True)
    serializer_class = AgendaSerializer
    permission_classes = [permissions.IsAuthenticated]

# Calendar Slots
class CalendarSlotListCreateView(generics.ListCreateAPIView):
    serializer_class = CalendarSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CalendarSlot.objects.select_related('agenda', 'staff') # staff is now User

        # Filter by agenda
        agenda_id = self.request.query_params.get('agenda_id')
        if agenda_id:
            queryset = queryset.filter(agenda_id=agenda_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(slot_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(slot_date__lte=end_date)

        # Filter by staff (now User ID)
        staff_id = self.request.query_params.get('staff_id')
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by('slot_date', 'start_time')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CalendarSlotCreateSerializer
        return CalendarSlotSerializer

class CalendarSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CalendarSlot.objects.all()
    serializer_class = CalendarSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_slots_view(request):
    """Get available slots for booking"""
    agenda_id = request.query_params.get('agenda_id')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    if not agenda_id:
        return Response({'error': 'agenda_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    queryset = CalendarSlot.objects.filter(
        agenda_id=agenda_id,
        status='available',
        current_bookings__lt=models.F('max_capacity')
    )

    if start_date:
        queryset = queryset.filter(slot_date__gte=start_date)
    if end_date:
        queryset = queryset.filter(slot_date__lte=end_date)

    # Only show future slots
    queryset = queryset.filter(slot_date__gte=timezone.now().date())

    serializer = CalendarSlotSerializer(queryset, many=True)
    return Response(serializer.data)

# Appointments
class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'talent':
            # Talents can only see their own appointments
            queryset = Appointment.objects.filter(talent=user)
        elif user.user_type == 'university_staff':
            # Staff can see appointments for their university
            try:
                # Assuming university_staff user has a UniversityProfile
                university_profile = user.university_profile
                queryset = Appointment.objects.filter(
                    calendar_slot__agenda__university=university_profile
                )
            except UniversityProfile.DoesNotExist:
                queryset = Appointment.objects.none()
            except AttributeError: # If user.university_profile doesn't exist
                queryset = Appointment.objects.none()
        else:
            # Admin can see all appointments
            queryset = Appointment.objects.all()

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(calendar_slot__slot_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(calendar_slot__slot_date__lte=end_date)

        return queryset.select_related('calendar_slot', 'talent').order_by('-created_at')

class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        # Check permissions
        if user.user_type == 'talent' and obj.talent != user:
            raise PermissionDenied("You can only access your own appointments")
        elif user.user_type == 'university_staff':
            try:
                university_profile = user.university_profile
                if obj.calendar_slot.agenda.university != university_profile:
                    raise PermissionDenied("You can only access appointments for your university")
            except UniversityProfile.DoesNotExist:
                raise PermissionDenied("University staff profile not found")
            except AttributeError:
                raise PermissionDenied("University staff access required")

        return obj

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def book_appointment_view(request):
    """Book an appointment"""
    if request.user.user_type != 'talent':
        return Response(
            {'error': 'Only talents can book appointments'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = AppointmentBookingSerializer(data=request.data)
    if serializer.is_valid():
        appointment = serializer.save(talent=request.user)
        response_serializer = AppointmentSerializer(appointment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment_view(request, appointment_id):
    """Cancel an appointment"""
    appointment = get_object_or_404(Appointment, id=appointment_id)

    # Check permissions
    if request.user.user_type == 'talent' and appointment.talent != request.user:
        return Response(
            {'error': 'You can only cancel your own appointments'},
            status=status.HTTP_403_FORBIDDEN
        )
    elif request.user.user_type == 'university_staff':
        try:
            university_profile = request.user.university_profile
            if appointment.calendar_slot.agenda.university != university_profile:
                return Response(
                    {'error': 'You can only cancel appointments for your university'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except UniversityProfile.DoesNotExist:
            return Response(
                {'error': 'University staff profile not found'},
                status=status.HTTP_403_FORBIDDEN
            )
        except AttributeError:
            return Response(
                {'error': 'University staff access required'},
                status=status.HTTP_403_FORBIDDEN
            )

    if appointment.status == 'cancelled':
        return Response(
            {'error': 'Appointment is already cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check cancellation deadline
    slot_datetime = datetime.combine(
        appointment.calendar_slot.slot_date,
        appointment.calendar_slot.start_time
    )
    cancellation_deadline = slot_datetime - timedelta(
        hours=appointment.calendar_slot.agenda.cancellation_deadline_hours
    )

    if timezone.now() > timezone.make_aware(cancellation_deadline):
        return Response(
            {'error': 'Cancellation deadline has passed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Cancel the appointment
    appointment.status = 'cancelled'
    appointment.cancelled_at = timezone.now()
    appointment.save()

    # Update slot booking count
    slot = appointment.calendar_slot
    slot.current_bookings -= 1
    slot.status = 'available'
    slot.save()

    serializer = AppointmentSerializer(appointment)
    return Response(serializer.data)

# Statistics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def appointment_statistics_view(request):
    """Get appointment statistics"""
    if request.user.user_type not in ['university_staff', 'admin']:
        return Response(
            {'error': 'Only university staff and admin can access statistics'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get university filter
    university_profile_id = request.query_params.get('university_profile_id')
    if request.user.user_type == 'university_staff':
        try:
            university_profile = request.user.university_profile
            university_profile_id = university_profile.id
        except UniversityProfile.DoesNotExist:
            return Response(
                {'error': 'University staff profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except AttributeError:
            return Response(
                {'error': 'University staff record not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    # Date range filter
    start_date = request.query_params.get('start_date', timezone.now().date() - timedelta(days=30))
    end_date = request.query_params.get('end_date', timezone.now().date())

    # Base queryset
    appointments = Appointment.objects.filter(
        calendar_slot__slot_date__range=[start_date, end_date]
    )

    if university_profile_id:
        appointments = appointments.filter(
            calendar_slot__agenda__university_id=university_profile_id
        )

    # Calculate statistics
    stats = {
        'total_appointments': appointments.count(),
        'confirmed_appointments': appointments.filter(status='confirmed').count(),
        'completed_appointments': appointments.filter(status='completed').count(),
        'cancelled_appointments': appointments.filter(status='cancelled').count(),
        'no_show_appointments': appointments.filter(status='no_show').count(),
        'unique_talents': appointments.values('talent').distinct().count(),
        'average_rating': appointments.filter(rating__isnull=False).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'],
        'total_duration_minutes': appointments.filter(
            status='completed'
        ).aggregate(
            total_duration=Sum('calendar_slot__agenda__slot_duration_minutes')
        )['total_duration'] or 0,
    }

    # Statistics by theme
    theme_stats = appointments.values(
        'calendar_slot__agenda__theme__name'
    ).annotate(
        count=Count('id'),
        completed=Count('id', filter=Q(status='completed')),
        cancelled=Count('id', filter=Q(status='cancelled'))
    ).order_by('-count')

    stats['by_theme'] = list(theme_stats)

    return Response(stats)
