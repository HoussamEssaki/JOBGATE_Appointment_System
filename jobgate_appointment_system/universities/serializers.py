# FileName: MultipleFiles/serializers.py (universities app)
from rest_framework import serializers
# Import UniversityProfile and User (assuming User is in users.models)
from .models import UniversityProfile
from users.serializers import UserSerializer # Assuming this exists

# Remove University and UniversityStaff serializers if those models are gone
# class UniversitySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = University
#         fields = ['id', 'name', 'description', 'address', 'city', 'country',
#                  'website_url', 'contact_email', 'contact_phone', 'logo_url',
#                  'is_active', 'created_at', 'updated_at']
#         read_only_fields = ['id', 'created_at', 'updated_at']

# class UniversityStaffSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
#     university = UniversitySerializer(read_only=True)
#     user_id = serializers.IntegerField(write_only=True)
#     university_id = serializers.IntegerField(write_only=True)

#     class Meta:
#         model = UniversityStaff
#         fields = ['id', 'user', 'university', 'user_id', 'university_id',
#                  'position', 'department', 'bio', 'specializations',
#                  'is_active', 'created_at', 'updated_at']
#         read_only_fields = ['id', 'created_at', 'updated_at']

# class UniversityStaffCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UniversityStaff
#         fields = ['user', 'university', 'position', 'department', 'bio', 'specializations']

class UniversityProfileSerializer(serializers.ModelSerializer):
    base_user = UserSerializer(read_only=True) # Include user details if needed

    class Meta:
        model = UniversityProfile
        fields = ['id', 'display_name', 'base_user', 'created_by', 'updated_by', 'current_task_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'current_task_id']

# If you still need a "detail" serializer for UniversityProfile, you can define it
# similar to how UniversityDetailSerializer was structured, potentially adding related agendas or staff (Users)
# class UniversityDetailSerializer(serializers.ModelSerializer):
#     # This would need to be re-evaluated based on how you link staff (Users) to UniversityProfile
#     # staff = UniversityStaffSerializer(many=True, read_only=True) # This would be gone
#     # total_staff = serializers.SerializerMethodField()

#     class Meta:
#         model = UniversityProfile
#         fields = ['id', 'display_name', 'base_user', 'created_at', 'updated_at'] # Adjust fields
#         read_only_fields = ['id', 'created_at', 'updated_at']

#     # def get_total_staff(self, obj):
#     #     # This logic would need to change to count users with user_type='university_staff'
#     #     # associated with this UniversityProfile
#     #     return User.objects.filter(user_type='university_staff', university_profile=obj).count()
