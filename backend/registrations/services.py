from django.utils import timezone

from accounts.models import User
from config.exceptions import Conflict, PermissionDenied, ValidationError
from events.models import Event
from registrations.models import Registration


def register_user_for_event(*, user: User, event: Event) -> Registration:
    if event.status != Event.Status.APPROVED:
        raise ValidationError(
            "O evento não está ativo para registro.",
            code="event_not_approved",
            field="event",
        )
    if event.event_date < timezone.now():
        raise ValidationError(
            "Não é possível se registrar para um evento que já ocorreu.",
            code="event_already_occurred",
            field="event",
        )
    if event.registration_set.count() >= event.capacity:
        raise ValidationError(
            "A capacidade do evento foi atingida.",
            code="event_full",
            field="event",
        )
    if Registration.objects.filter(user=user, event=event).exists():
        raise Conflict(
            "O usuário já está registrado para este evento.",
            code="already_registered",
        )
    return Registration.objects.create(user=user, event=event)


def set_check_in(*, registration: Registration, acting_user: User, check_in: bool):
    is_organizer = registration.event.organizer == acting_user
    is_admin = acting_user.role == User.Role.ADMIN
    if not (is_organizer or is_admin):
        raise PermissionDenied(
            "Apenas o organizador do evento pode confirmar a presença.",
            code="check_in_not_allowed",
        )
    registration.check_in = bool(check_in)
    registration.save(update_fields=["check_in"])
    return registration
