from rest_framework.permissions import BasePermission

from accounts.models import User

class IsOwnerOrAdmin(BasePermission):
    message = "Apenas o dono do registro ou administradores podem excluí-lo."

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.is_authenticated and (
            obj.user == request.user or request.user.role == User.Role.ADMIN
        )
