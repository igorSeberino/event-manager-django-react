from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Registration
        fields = [field.name for field in Registration._meta.fields] + ["user_name"]
        read_only_fields = ["id", "registered_at", "user"]
