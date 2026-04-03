from django.utils import timezone

from accounts.models import User
from config.exceptions import ValidationError
from events.models import Event
from registrations.models import Registration


def register_user_for_event(*, user: User, event: Event) -> Registration:
    if event.status != Event.Status.APPROVED:
        raise ValidationError("O evento não está ativo para registro.")
    if event.event_date < timezone.now():
        raise ValidationError(
            "Não é possível se registrar para um evento que já ocorreu."
        )
    if event.registration_set.count() >= event.capacity:
        raise ValidationError("A capacidade do evento foi atingida.")
    if Registration.objects.filter(user=user, event=event).exists():
        raise ValidationError("O usuário já está registrado para este evento.")
    return Registration.objects.create(user=user, event=event)
