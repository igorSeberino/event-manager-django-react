from django.utils import timezone

from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["id", "status"]

    def validate_event_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data do evento deve ser no futuro.")
        return value
