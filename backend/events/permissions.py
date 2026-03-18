from rest_framework.permissions import BasePermission

from accounts.models import User


class IsOrganizerOrAdmin(BasePermission):
    message = "Apenas organizadores ou administradores podem criar eventos."

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.is_authenticated and request.user.role in (
            User.Role.ORGANIZER,
            User.Role.ADMIN,
        )


class IsOwnerOrAdmin(BasePermission):
    message = "Apenas o organizador do evento ou administradores podem editar ou excluir este evento."

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.is_authenticated and (
            obj.organizer == request.user or request.user.role == User.Role.ADMIN
        )
