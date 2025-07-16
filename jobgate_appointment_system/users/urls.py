from django.urls import path, include
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('preferences/', views.UserPreferencesView.as_view(), name='preferences'),
    path('list/', views.UserListView.as_view(), name='list'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]


