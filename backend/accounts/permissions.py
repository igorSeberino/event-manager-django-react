from rest_framework.permissions import BasePermission

from .models import User


class IsOwnerOrAdmin(BasePermission):
    message = "Apenas o proprietário da conta ou administradores podem editar ou excluir esta conta."

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.is_authenticated and (
            obj == request.user or request.user.role == User.Role.ADMIN
        )
