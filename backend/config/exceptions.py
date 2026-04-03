class ServiceError(Exception):
    """Base para todas as exceções da service layer."""

    pass


class ValidationError(ServiceError):
    """Regra de negócio violada. Traduzida para HTTP 400 pela view."""

    pass


class PermissionDenied(ServiceError):
    """Usuário não tem permissão para esta operação. Traduzida para HTTP 403."""

    pass


class NotFound(ServiceError):
    """Recurso não encontrado. Traduzida para HTTP 404."""

    pass
