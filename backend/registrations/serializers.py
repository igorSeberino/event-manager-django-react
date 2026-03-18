from django.utils import timezone

from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = "__all__"
        read_only_fields = ["id", "registered_at", "user"]

    def create(self, validated_data):
        user = self.context["request"].user
        event = validated_data["event"]
        if Registration.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError(
                "O usuário já está registrado para este evento."
            )
        return super().create({**validated_data, "user": user})

    def validate_event(self, value):
        if value.event_date < timezone.now():
            raise serializers.ValidationError(
                "Não é possível se registrar para um evento que já ocorreu."
            )
        elif value.capacity <= value.registration_set.count():
            raise serializers.ValidationError("A capacidade do evento foi atingida.")
        elif value.status != "APPROVED":
            raise serializers.ValidationError("O evento não está ativo para registro.")
        return value
