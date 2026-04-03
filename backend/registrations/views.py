from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from . import services
from .models import Registration
from .permissions import IsOwnerOrAdmin
from .serializers import RegistrationSerializer


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration = services.register_user_for_event(
            user=request.user,
            event=serializer.validated_data["event"],
        )
        return Response(
            self.get_serializer(registration).data, status=status.HTTP_201_CREATED
        )
