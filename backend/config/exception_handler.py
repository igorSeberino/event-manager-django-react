import logging

from django.http import Http404
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied as DRFPermissionDenied,
    ValidationError as DRFValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from config.exceptions import (
    Conflict,
    NotFound,
    PermissionDenied,
    ServiceError,
    ValidationError,
)

logger = logging.getLogger("api.errors")

SERVICE_EXCEPTION_STATUS_MAP = {
    ValidationError: status.HTTP_400_BAD_REQUEST,
    PermissionDenied: status.HTTP_403_FORBIDDEN,
    NotFound: status.HTTP_404_NOT_FOUND,
    Conflict: status.HTTP_409_CONFLICT,
}


def _build_error_response(code, message, status_code, field=None):
    body = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if field:
        body["error"]["field"] = field
    return Response(body, status=status_code)


def _format_drf_validation_errors(detail):
    if isinstance(detail, list):
        return None, str(detail[0])
    if isinstance(detail, dict):
        for field_name, messages in detail.items():
            msg = messages[0] if isinstance(messages, list) else messages
            if field_name == "non_field_errors":
                return None, str(msg)
            return field_name, str(msg)
    return None, str(detail)


def api_exception_handler(exc, context):
    # 1) Service layer exceptions
    if isinstance(exc, ServiceError):
        status_code = SERVICE_EXCEPTION_STATUS_MAP.get(
            type(exc), status.HTTP_400_BAD_REQUEST
        )
        logger.warning(
            "Service error: [%s] %s (view=%s)",
            exc.code,
            exc.message,
            context["view"].__class__.__name__,
        )
        return _build_error_response(exc.code, exc.message, status_code, exc.field)

    # 2) DRF validation errors — padronizar formato
    if isinstance(exc, DRFValidationError):
        field, message = _format_drf_validation_errors(exc.detail)
        return _build_error_response(
            "validation_error", message, exc.status_code, field
        )

    # 3) Auth errors
    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        return _build_error_response(
            "authentication_error",
            str(exc.detail),
            exc.status_code,
        )

    # 4) DRF/Django permission errors
    if isinstance(exc, (DRFPermissionDenied, DjangoPermissionDenied)):
        detail = getattr(exc, "detail", str(exc))
        return _build_error_response(
            "permission_denied",
            str(detail),
            status.HTTP_403_FORBIDDEN,
        )

    # 5) Django 404
    if isinstance(exc, Http404):
        return _build_error_response(
            "not_found",
            str(exc) if str(exc) else "Recurso não encontrado.",
            status.HTTP_404_NOT_FOUND,
        )

    # 6) Outras exceções do DRF
    if isinstance(exc, APIException):
        return _build_error_response(
            exc.default_code,
            str(exc.detail),
            exc.status_code,
        )

    # 7) Exceções não tratadas — log completo e resposta genérica
    logger.exception("Unhandled exception in %s", context["view"].__class__.__name__)
    return _build_error_response(
        "internal_error",
        "Erro interno do servidor.",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
