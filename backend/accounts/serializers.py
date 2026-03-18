import re

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "name", "email", "password", "role", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_password(self, value):
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "A senha deve conter pelo menos uma letra maiúscula."
            )
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError(
                "A senha deve conter pelo menos uma letra minúscula."
            )
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError(
                "A senha deve conter pelo menos um número."
            )
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError(
                "A senha deve conter pelo menos um caractere especial."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def validate_role(self, value):
        request = self.context.get("request")
        if request:
            if request.method in ["PUT", "PATCH"] and request.user.role != User.Role.ADMIN:
                    raise serializers.ValidationError(
                        "Apenas administradores podem definir ou alterar o papel do usuário."
                    )
            elif request.method == "POST" and value != User.Role.USER:
                raise serializers.ValidationError(
                    "O papel do usuário deve ser 'USER' ao criar uma nova conta."
                )
        return value
