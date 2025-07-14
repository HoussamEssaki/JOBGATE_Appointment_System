from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import University, UniversityStaff
from .serializers import (
    UniversitySerializer, UniversityDetailSerializer,
    UniversityStaffSerializer, UniversityStaffCreateSerializer
)

class UniversityListCreateView(generics.ListCreateAPIView):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # Only admin users can create universities
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class UniversityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = University.objects.all()
    serializer_class = UniversityDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only admin users can modify universities
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class UniversityStaffListCreateView(generics.ListCreateAPIView):
    serializer_class = UniversityStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        university_id = self.kwargs.get('university_id')
        if university_id:
            return UniversityStaff.objects.filter(
                university_id=university_id, 
                is_active=True
            )
        return UniversityStaff.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UniversityStaffCreateSerializer
        return UniversityStaffSerializer
    
    def perform_create(self, serializer):
        university_id = self.kwargs.get('university_id')
        if university_id:
            university = get_object_or_404(University, id=university_id)
            serializer.save(university=university)
        else:
            serializer.save()

class UniversityStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UniversityStaff.objects.all()
    serializer_class = UniversityStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        university_id = self.kwargs.get('university_id')
        staff_id = self.kwargs.get('staff_id')
        return get_object_or_404(
            UniversityStaff,
            id=staff_id,
            university_id=university_id,
            is_active=True
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_universities_view(request):
    """Get universities where the current user is staff"""
    if request.user.user_type != 'university_staff':
        return Response(
            {'error': 'Only university staff can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    staff_records = UniversityStaff.objects.filter(
        user=request.user,
        is_active=True
    ).select_related('university')
    
    universities = [staff.university for staff in staff_records]
    serializer = UniversitySerializer(universities, many=True)
    
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_by_university_view(request, university_id):
    """Get all staff members for a specific university"""
    university = get_object_or_404(University, id=university_id)
    staff = UniversityStaff.objects.filter(
        university=university,
        is_active=True
    ).select_related('user')
    
    serializer = UniversityStaffSerializer(staff, many=True)
    return Response(serializer.data)

