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
