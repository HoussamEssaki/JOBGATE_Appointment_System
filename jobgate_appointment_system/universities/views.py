# FileName: MultipleFiles/views.py (universities app)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import UniversityProfile # Only UniversityProfile
from .serializers import UniversityProfileSerializer # Only UniversityProfileSerializer
from users.models import User # Import User model

class UniversityListCreateView(generics.ListCreateAPIView):
    # Now lists/creates UniversityProfile
    queryset = UniversityProfile.objects.all() # Filter as needed, e.g., is_active=True
    serializer_class = UniversityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            # Only admin users can create university profiles
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Set created_by to the current user
        serializer.save(created_by=self.request.user, base_user=self.request.user) # Assuming base_user is also the creator

class UniversityDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Now retrieves/updates/destroys UniversityProfile
    queryset = UniversityProfile.objects.all()
    serializer_class = UniversityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only admin users can modify university profiles
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

# The following views related to UniversityStaff will need to be re-thought or removed
# if UniversityStaff model is gone.
# If "staff" is now just a User with user_type='university_staff', these endpoints
# would need to query the User model directly and filter by user_type.

# class UniversityStaffListCreateView(generics.ListCreateAPIView):
#     # This view needs to be completely re-written or removed
#     pass

# class UniversityStaffDetailView(generics.RetrieveUpdateDestroyAPIView):
#     # This view needs to be completely re-written or removed
#     pass

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_universities_view(request):
    """Get university profiles where the current user is associated as staff"""
    if request.user.user_type != 'university_staff':
        return Response(
            {'error': 'Only university staff can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Assuming a university_staff user has a OneToOneField to UniversityProfile
    try:
        university_profile = request.user.university_profile
        serializer = UniversityProfileSerializer(university_profile)
        return Response(serializer.data)
    except UniversityProfile.DoesNotExist:
        return Response(
            {'error': 'University profile not found for this staff member'},
            status=status.HTTP_404_NOT_FOUND
        )
    except AttributeError:
        return Response(
            {'error': 'User is not linked to a university profile'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_by_university_view(request, university_id):
    """Get all staff members (Users) for a specific university profile"""
    # university_id here would refer to UniversityProfile ID
    university_profile = get_object_or_404(UniversityProfile, id=university_id)

    # Assuming staff are Users with user_type='university_staff' and linked to this profile
    staff_users = User.objects.filter(
        user_type='university_staff',
        university_profile=university_profile, # This assumes a reverse relation from User to UniversityProfile
        is_active=True
    )

    serializer = UserSerializer(staff_users, many=True) # Use UserSerializer
    return Response(serializer.data)
