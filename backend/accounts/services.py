import re

from accounts.models import User
from config.exceptions import Conflict, PermissionDenied, ValidationError


def _validate_password_strength(password: str) -> None:
    if not re.search(r"[A-Z]", password):
        raise ValidationError(
            "A senha deve conter pelo menos uma letra maiúscula.",
            code="password_missing_uppercase",
            field="password",
        )
    if not re.search(r"[a-z]", password):
        raise ValidationError(
            "A senha deve conter pelo menos uma letra minúscula.",
            code="password_missing_lowercase",
            field="password",
        )
    if not re.search(r"[0-9]", password):
        raise ValidationError(
            "A senha deve conter pelo menos um número.",
            code="password_missing_digit",
            field="password",
        )
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError(
            "A senha deve conter pelo menos um caractere especial.",
            code="password_missing_special",
            field="password",
        )


def create_user(*, name: str, email: str, password: str) -> User:
    _validate_password_strength(password)
    if User.objects.filter(email=email).exists():
        raise Conflict(
            "Já existe um usuário com este email.",
            code="email_already_exists",
            field="email",
        )
    user = User(name=name, email=email, role=User.Role.USER)
    user.set_password(password)
    user.save()
    return user


def update_user(
    *,
    instance: User,
    acting_user: User,
    name: str | None = None,
    email: str | None = None,
    password: str | None = None,
    role: str | None = None,
) -> User:
    if role is not None and acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Apenas administradores podem definir ou alterar o papel do usuário.",
            code="role_change_not_allowed",
        )
    if acting_user.id != instance.id and acting_user.role != User.Role.ADMIN:
        raise PermissionDenied(
            "Usuários só podem atualizar seus próprios dados, a menos que sejam administradores.",
            code="update_other_user_not_allowed",
        )
    if name is not None:
        instance.name = name
    if email is not None:
        instance.email = email
    if role is not None:
        instance.role = role
    if password is not None:
        _validate_password_strength(password)
        instance.set_password(password)
    instance.save()
    return instance
