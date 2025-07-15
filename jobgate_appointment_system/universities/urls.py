from django.urls import path
from . import views

app_name = 'universities'

urlpatterns = [
    path('', views.UniversityListCreateView.as_view(), name='university-list-create'),
    path('<int:pk>/', views.UniversityDetailView.as_view(), name='university-detail'),
    path('my/', views.my_universities_view, name='my-universities'),
    
    # Staff endpoints
    path('<int:university_id>/staff/', views.UniversityStaffListCreateView.as_view(), name='staff-list-create'),
    path('<int:university_id>/staff/<int:staff_id>/', views.UniversityStaffDetailView.as_view(), name='staff-detail'),
    path('<int:university_id>/staff/list/', views.staff_by_university_view, name='staff-by-university'),
]

