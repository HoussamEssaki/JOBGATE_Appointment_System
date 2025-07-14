from rest_framework import serializers
from .models import University, UniversityStaff
from users.serializers import UserSerializer

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name', 'description', 'address', 'city', 'country',
                 'website_url', 'contact_email', 'contact_phone', 'logo_url',
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UniversityStaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    university_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UniversityStaff
        fields = ['id', 'user', 'university', 'user_id', 'university_id',
                 'position', 'department', 'bio', 'specializations',
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UniversityStaffCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityStaff
        fields = ['user', 'university', 'position', 'department', 'bio', 'specializations']

class UniversityDetailSerializer(serializers.ModelSerializer):
    staff = UniversityStaffSerializer(many=True, read_only=True)
    total_staff = serializers.SerializerMethodField()
    
    class Meta:
        model = University
        fields = ['id', 'name', 'description', 'address', 'city', 'country',
                 'website_url', 'contact_email', 'contact_phone', 'logo_url',
                 'is_active', 'created_at', 'updated_at', 'staff', 'total_staff']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_staff(self, obj):
        return obj.staff.filter(is_active=True).count()

