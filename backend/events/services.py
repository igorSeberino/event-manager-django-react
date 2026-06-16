from django.utils import timezone

from accounts.models import User
from config.exceptions import Conflict, PermissionDenied, ValidationError
from events.models import Category, Event, SubCategory


def _validate_event_date(event_date) -> None:
    if event_date < timezone.now():
        raise ValidationError(
            "A data do evento deve ser no futuro.",
            code="event_date_in_past",
            field="event_date",
        )


def create_event(
    *,
    title: str,
    description: str,
    location: str,
    event_date,
    capacity: int,
    organizer: User,
    acting_user: User,
    category_id=None,
    subcategory_id=None,
    status: str | None = Event.Status.PENDING,
) -> Event:
    _validate_event_date(event_date)
    if acting_user.role not in (User.Role.ORGANIZER, User.Role.ADMIN):
        raise PermissionDenied(
            "Apenas organizadores e administradores podem criar eventos.",
            code="event_creation_not_allowed",
        )
    if acting_user.role != User.Role.ADMIN and status != Event.Status.PENDING:
        raise PermissionDenied(
            "Apenas administradores podem definir o status na criação do evento.",
            code="event_status_change_not_allowed",
        )
    event = Event(
        title=title,
        description=description,
        location=location,
        event_date=event_date,
        capacity=capacity,
        organizer=organizer,
        status=status,
        category_id=category_id,
        subcategory_id=subcategory_id,
    )
    event.save()
    return event


def update_event(*, instance: Event, acting_user: User, **fields) -> Event:
    if acting_user != instance.organizer:
        raise PermissionDenied(
            "Apenas o organizador do evento pode editá-lo.",
            code="event_update_not_allowed",
        )
    if instance.is_finished:
        raise ValidationError(
            "Não é possível editar um evento que já foi realizado.",
            code="event_already_finished",
        )
    if "event_date" in fields:
        _validate_event_date(fields["event_date"])
    for attr, value in fields.items():
        setattr(instance, attr, value)
    instance.save()
    return instance


def approve_event(*, instance: Event, acting_user: User) -> Event:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem aprovar eventos.",
            code="event_moderation_admin_only",
        )
    instance.status = Event.Status.APPROVED
    instance.rejection_reason = ""
    instance.save()
    return instance


def reject_event(*, instance: Event, acting_user: User, reason: str) -> Event:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem rejeitar eventos.",
            code="event_moderation_admin_only",
        )
    reason = (reason or "").strip()
    if not reason:
        raise ValidationError(
            "Informe o motivo da rejeição para o organizador.",
            code="rejection_reason_required",
            field="rejection_reason",
        )
    instance.status = Event.Status.REJECTED
    instance.rejection_reason = reason
    instance.save()
    return instance


def resubmit_event(*, instance: Event, acting_user: User) -> Event:
    if acting_user != instance.organizer:
        raise PermissionDenied(
            "Apenas o organizador do evento pode reenviá-lo para análise.",
            code="event_resubmit_not_allowed",
        )
    if instance.status != Event.Status.REJECTED:
        raise ValidationError(
            "Apenas eventos rejeitados podem ser reenviados para análise.",
            code="event_not_rejected",
        )
    if instance.is_finished:
        raise ValidationError(
            "Não é possível reenviar um evento que já foi realizado.",
            code="event_already_finished",
        )
    instance.status = Event.Status.PENDING
    instance.rejection_reason = ""
    instance.save()
    return instance


def close_event(*, instance: Event, acting_user: User) -> Event:
    if acting_user != instance.organizer:
        raise PermissionDenied(
            "Apenas o organizador do evento pode encerrá-lo.",
            code="event_close_not_allowed",
        )
    if instance.status != Event.Status.APPROVED:
        raise ValidationError(
            "Apenas eventos aprovados podem ser encerrados.",
            code="event_not_approved",
        )
    if instance.is_finished:
        raise ValidationError(
            "O evento já foi encerrado.",
            code="event_already_finished",
        )
    if instance.event_date > timezone.now():
        raise ValidationError(
            "O evento ainda não começou; não é possível encerrá-lo.",
            code="event_not_started",
        )
    instance.closed_at = timezone.now()
    instance.save(update_fields=["closed_at"])
    return instance


def create_category(*, name: str, acting_user: User) -> Category:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem criar categorias.",
            code="category_admin_only",
        )
    if not name.strip():
        raise ValidationError(
            "O nome da categoria não pode estar vazio.",
            code="category_name_empty",
            field="name",
        )
    if Category.objects.filter(name__iexact=name).exists():
        raise Conflict(
            "Já existe uma categoria com este nome.",
            code="category_name_taken",
            field="name",
        )
    return Category.objects.create(name=name)


def update_category(*, instance: Category, name: str, acting_user: User) -> Category:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem atualizar categorias.",
            code="category_admin_only",
        )
    if not name.strip():
        raise ValidationError(
            "O nome da categoria não pode estar vazio.",
            code="category_name_empty",
            field="name",
        )
    if Category.objects.filter(name__iexact=name).exclude(pk=instance.pk).exists():
        raise Conflict(
            "Já existe uma categoria com este nome.",
            code="category_name_taken",
            field="name",
        )
    instance.name = name
    instance.save()
    return instance


def create_subcategory(*, name: str, category_id, acting_user: User) -> SubCategory:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem criar subcategorias.",
            code="subcategory_admin_only",
        )
    if not name.strip():
        raise ValidationError(
            "O nome da subcategoria não pode estar vazio.",
            code="subcategory_name_empty",
            field="name",
        )
    if SubCategory.objects.filter(name__iexact=name).exists():
        raise Conflict(
            "Já existe uma subcategoria com este nome.",
            code="subcategory_name_taken",
            field="name",
        )
    return SubCategory.objects.create(name=name, category_id=category_id)


def update_subcategory(
    *, instance: SubCategory, name: str, acting_user: User
) -> SubCategory:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem atualizar subcategorias.",
            code="subcategory_admin_only",
        )
    if not name.strip():
        raise ValidationError(
            "O nome da subcategoria não pode estar vazio.",
            code="subcategory_name_empty",
            field="name",
        )
    if SubCategory.objects.filter(name__iexact=name).exclude(pk=instance.pk).exists():
        raise Conflict(
            "Já existe uma subcategoria com este nome.",
            code="subcategory_name_taken",
            field="name",
        )
    instance.name = name
    instance.save()
    return instance
