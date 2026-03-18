from django.utils import timezone

from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_event_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data do evento deve ser no futuro.")
        return value
    
    def validate_status(self,value):
        request = self.context.get('request')
        if request:
            if request.method == 'POST' and request.user.role != 'ADMIN':
                if value != "PENDING":
                    raise serializers.ValidationError("Apenas administradores podem definir o status na criação do evento.")
            elif request.method in ['PUT', 'PATCH'] and request.user.role != 'ADMIN':
                raise serializers.ValidationError("Apenas administradores podem alterar o status do evento.")
        return value
