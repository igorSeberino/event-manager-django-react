from urllib import request

from django.utils import timezone

from rest_framework import serializers
from .models import Event, Category, SubCategory


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_event_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data do evento deve ser no futuro.")
        return value

    def validate_status(self, value):
        request = self.context.get("request")
        if request:
            if request.method == "POST" and request.user.role != "ADMIN":
                if value != "PENDING":
                    raise serializers.ValidationError(
                        "Apenas administradores podem definir o status na criação do evento."
                    )
            elif request.method in ["PUT", "PATCH"] and request.user.role != "ADMIN":
                raise serializers.ValidationError(
                    "Apenas administradores podem alterar o status do evento."
                )
        return value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("O nome da categoria não pode estar vazio.")
        if Category.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Já existe uma categoria com este nome.")
        return value


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("O nome da subcategoria não pode estar vazio.")
        if SubCategory.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Já existe uma subcategoria com este nome.")
        return value
