class ServiceError(Exception):
    default_code = "service_error"

    def __init__(self, message, code=None, field=None):
        self.message = message
        self.code = code or self.default_code
        self.field = field
        super().__init__(message)


class ValidationError(ServiceError):
    default_code = "validation_error"


class PermissionDenied(ServiceError):
    default_code = "permission_denied"


class NotFound(ServiceError):
    default_code = "not_found"


class Conflict(ServiceError):
    default_code = "conflict"
