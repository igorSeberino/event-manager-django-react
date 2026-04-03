from django.utils import timezone

from accounts.models import User
from config.exceptions import PermissionDenied, ValidationError
from events.models import Category, Event, SubCategory


def _validate_event_date(event_date) -> None:
    if event_date < timezone.now():
        raise ValidationError("A data do evento deve ser no futuro.")


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
            "Apenas organizadores e administradores podem criar eventos."
        )
    if acting_user.role != User.Role.ADMIN and status != Event.Status.PENDING:
        raise PermissionDenied(
            "Apenas administradores podem definir o status na criação do evento."
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


def update_event(
    *, instance: Event, acting_user: User, status: str | None = None, **fields
) -> Event:
    if acting_user != instance.organizer and acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas o organizador do evento ou um administrador podem atualizá-lo."
        )
    if status is not None and acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem alterar o status do evento."
        )
    if "event_date" in fields:
        _validate_event_date(fields["event_date"])
    for attr, value in fields.items():
        setattr(instance, attr, value)
    if status is not None:
        instance.status = status
    instance.save()
    return instance


def create_category(*, name: str, acting_user: User) -> Category:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied("Apenas administradores podem criar categorias.")
    if not name.strip():
        raise ValidationError("O nome da categoria não pode estar vazio.")
    if Category.objects.filter(name__iexact=name).exists():
        raise ValidationError("Já existe uma categoria com este nome.")
    return Category.objects.create(name=name)


def update_category(*, instance: Category, name: str, acting_user: User) -> Category:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied("Apenas administradores podem atualizar categorias.")
    if not name.strip():
        raise ValidationError("O nome da categoria não pode estar vazio.")
    if Category.objects.filter(name__iexact=name).exclude(pk=instance.pk).exists():
        raise ValidationError("Já existe uma categoria com este nome.")
    instance.name = name
    instance.save()
    return instance


def create_subcategory(*, name: str, category_id, acting_user: User) -> SubCategory:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied("Apenas administradores podem criar subcategorias.")
    if not name.strip():
        raise ValidationError("O nome da subcategoria não pode estar vazio.")
    if SubCategory.objects.filter(name__iexact=name).exists():
        raise ValidationError("Já existe uma subcategoria com este nome.")
    return SubCategory.objects.create(name=name, category_id=category_id)


def update_subcategory(
    *, instance: SubCategory, name: str, acting_user: User
) -> SubCategory:
    if acting_user.role != User.Role.ADMIN:
        raise PermissionDenied("Apenas administradores podem atualizar subcategorias.")
    if not name.strip():
        raise ValidationError("O nome da subcategoria não pode estar vazio.")
    if SubCategory.objects.filter(name__iexact=name).exclude(pk=instance.pk).exists():
        raise ValidationError("Já existe uma subcategoria com este nome.")
    instance.name = name
    instance.save()
    return instance
