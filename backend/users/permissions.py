from rest_framework import permissions
from universities.models import UniversityStaff

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user

class IsUniversityStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow university staff to create/edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return (request.user.is_authenticated and 
                request.user.user_type in ['university_staff', 'admin'])

class IsUniversityStaff(permissions.BasePermission):
    """
    Permission class to check if user is university staff.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.user_type in ['university_staff', 'admin'])

class IsTalent(permissions.BasePermission):
    """
    Permission class to check if user is a talent.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.user_type == 'talent')

class IsAdminUser(permissions.BasePermission):
    """
    Permission class to check if user is an admin.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.user_type == 'admin')

class IsStaffOfUniversity(permissions.BasePermission):
    """
    Permission to check if user is staff of the specific university.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        if request.user.user_type == 'admin':
            return True
        
        if request.user.user_type != 'university_staff':
            return False
        
        try:
            staff = UniversityStaff.objects.get(user=request.user)
            # Check if the object has a university field
            if hasattr(obj, 'university'):
                return staff.university == obj.university
            # Check if the object has an agenda with university
            elif hasattr(obj, 'agenda') and hasattr(obj.agenda, 'university'):
                return staff.university == obj.agenda.university
            # Check if the object is a university staff object
            elif hasattr(obj, 'university_id'):
                return staff.university_id == obj.university_id
        except UniversityStaff.DoesNotExist:
            return False
        
        return False

class CanManageAppointments(permissions.BasePermission):
    """
    Permission to check if user can manage appointments.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admins can manage all appointments
        if request.user.user_type == 'admin':
            return True
        
        # University staff can manage appointments for their university
        if request.user.user_type == 'university_staff':
            return True
        
        # Talents can only view and book appointments
        if request.user.user_type == 'talent':
            return request.method in permissions.SAFE_METHODS or request.method == 'POST'
        
        return False

class CanViewAppointment(permissions.BasePermission):
    """
    Permission to check if user can view a specific appointment.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Admins can view all appointments
        if request.user.user_type == 'admin':
            return True
        
        # Talents can view their own appointments
        if request.user.user_type == 'talent':
            return obj.talent == request.user
        
        # University staff can view appointments for their university
        if request.user.user_type == 'university_staff':
            try:
                staff = UniversityStaff.objects.get(user=request.user)
                return staff.university == obj.calendar_slot.agenda.university
            except UniversityStaff.DoesNotExist:
                return False
        
        return False

class CanCancelAppointment(permissions.BasePermission):
    """
    Permission to check if user can cancel a specific appointment.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Can't cancel completed or already cancelled appointments
        if obj.status in ['completed', 'cancelled']:
            return False
        
        # Admins can cancel any appointment
        if request.user.user_type == 'admin':
            return True
        
        # Talents can cancel their own appointments
        if request.user.user_type == 'talent':
            return obj.talent == request.user
        
        # University staff can cancel appointments for their university
        if request.user.user_type == 'university_staff':
            try:
                staff = UniversityStaff.objects.get(user=request.user)
                return staff.university == obj.calendar_slot.agenda.university
            except UniversityStaff.DoesNotExist:
                return False
        
        return False

