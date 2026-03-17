from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = "__all__"
        read_only_fields = ["id", "registered_at"]

    def validate(self, data):
        user = data.get("user")
        event = data.get("event")
        if Registration.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError(
                "O usuário já está registrado para este evento."
            )
        return data