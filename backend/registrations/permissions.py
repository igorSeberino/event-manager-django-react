from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import User


class RegistrationPermission(BasePermission):
    message = "Você não tem permissão para esta ação sobre a inscrição."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        is_admin = request.user.role == User.Role.ADMIN
        # Cancelar inscrição: o próprio participante ou o admin (controle da lista).
        if request.method == "DELETE":
            return obj.user == request.user or is_admin
        # Confirmar presença (check-in): apenas o organizador do evento ou o admin.
        # O próprio usuário não pode confirmar a sua presença.
        if request.method in ("PATCH", "PUT"):
            return obj.event.organizer == request.user or is_admin
        return False
