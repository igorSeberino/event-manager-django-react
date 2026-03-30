from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsOwnerOrAdmin
from .serializers import UserSerializer, CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_superuser=False)
    permission_classes = [IsOwnerOrAdmin]
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
