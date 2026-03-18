from rest_framework import viewsets

from .models import User
from .permissions import IsOwnerOrAdmin
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_superuser=False)
    permission_classes = [IsOwnerOrAdmin]
    serializer_class = UserSerializer
