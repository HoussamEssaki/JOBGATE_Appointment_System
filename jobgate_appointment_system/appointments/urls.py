from django.urls import path
from . import views

app_name = 'appointments'

urlpatterns = [
    # Appointment Themes
    path('themes/', views.AppointmentThemeListView.as_view(), name='theme-list'),
    
    # Agendas
    path('agendas/', views.AgendaListCreateView.as_view(), name='agenda-list-create'),
    path('agendas/<int:pk>/', views.AgendaDetailView.as_view(), name='agenda-detail'),
    
    # Calendar Slots
    path('slots/', views.CalendarSlotListCreateView.as_view(), name='slot-list-create'),
    path('slots/<int:pk>/', views.CalendarSlotDetailView.as_view(), name='slot-detail'),
    path('slots/available/', views.available_slots_view, name='available-slots'),
    
    # Appointments
    path('', views.AppointmentListView.as_view(), name='appointment-list'),
    path('<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('book/', views.book_appointment_view, name='book-appointment'),
    path('<int:appointment_id>/cancel/', views.cancel_appointment_view, name='cancel-appointment'),
    
    # Statistics
    path('statistics/', views.appointment_statistics_view, name='statistics'),
]

