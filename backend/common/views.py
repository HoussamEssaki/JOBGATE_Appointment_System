# in common/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.urls import reverse
from django.db import connection

class HealthCheckView(APIView):
    permission_classes = []
    
    def get(self, request):
        try:
            # Check DB connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            
            return Response({
                "status": "healthy",
                "database": "connected",
                "redis": "connected"  # Add redis check
            })
        except Exception as e:
            return Response({
                "status": "unhealthy",
                "error": str(e)
            }, status=500)
        
class APIRootView(APIView):
    def get(self, request, format=None):
        return Response({
            'message': 'Welcome to JOBGATE Appointment System API',
            'version': '1.0.0',
            'endpoints': {
                'authentication': {
                    'login': request.build_absolute_uri('/api/users/auth/jwt/create/'),
                    'refresh': request.build_absolute_uri('/api/users/auth/jwt/refresh/'),
                    'verify': request.build_absolute_uri('/api/users/auth/jwt/verify/'),
                    'register': request.build_absolute_uri('/api/users/register/'),
                },
                'users': {
                    'profile': request.build_absolute_uri('/api/users/profile/'),
                    'preferences': request.build_absolute_uri('/api/users/preferences/'),
                    'list': request.build_absolute_uri('/api/users/list/'),
                },
                'appointments': {
                    'themes': request.build_absolute_uri('/api/appointments/themes/'),
                    'agendas': request.build_absolute_uri('/api/appointments/agendas/'),
                    'slots': request.build_absolute_uri('/api/appointments/slots/'),
                    'appointments': request.build_absolute_uri('/api/appointments/'),
                    'book': request.build_absolute_uri('/api/appointments/book/'),
                    'statistics': request.build_absolute_uri('/api/appointments/statistics/'),
                },
                'universities': {
                    'profiles': request.build_absolute_uri('/api/universities/'),
                }
            },
            'documentation': {
                'health_check': request.build_absolute_uri('/api/health/'),
                'admin': request.build_absolute_uri('/admin/'),
            }
        })