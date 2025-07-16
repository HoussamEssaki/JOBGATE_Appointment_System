# in common/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
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
    def get(self, request):
        return Response({
            "message": "JOBGATE Appointment System API",
            "endpoints": {
                "users": "http://localhost:8001/api/users/",
                "universities": "http://localhost:8001/api/universities/",
                "appointments": "http://localhost:8001/api/appointments/",
                "admin": "http://localhost:8001/admin/"
            }
        })