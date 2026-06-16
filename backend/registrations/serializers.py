from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    attendance_status = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [field.name for field in Registration._meta.fields] + [
            "user_name",
            "attendance_status",
        ]
        read_only_fields = ["id", "registered_at", "user"]

    def get_attendance_status(self, obj):
        # PRESENT: fez check-in | ABSENT: evento encerrado sem check-in (falta)
        # PENDING: evento ainda não encerrou
        if obj.check_in:
            return "PRESENT"
        if obj.event.is_finished:
            return "ABSENT"
        return "PENDING"
