from rest_framework import status
from rest_framework.response import Response

from config.exceptions import NotFound, PermissionDenied, ValidationError


class ServiceExceptionMixin:
    def handle_service_error(self, exc):
        if isinstance(exc, ValidationError):
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, PermissionDenied):
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        if isinstance(exc, NotFound):
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        raise exc
