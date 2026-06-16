from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from config.cookies import auth_cookie_kwargs

from . import services
from .models import User
from .permissions import IsOwnerOrAdmin
from .serializers import UserSerializer, CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_superuser=False)
    permission_classes = [IsOwnerOrAdmin]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = services.create_user(
            name=serializer.validated_data["name"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        user = services.update_user(
            instance=instance,
            acting_user=request.user,
            **serializer.validated_data,
        )
        return Response(self.get_serializer(user).data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user
        tokens = serializer.validated_data

        response = Response(
            {
                "user": {
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                }
            },
            status=status.HTTP_200_OK,
        )

        cookie_kwargs = auth_cookie_kwargs()
        response.set_cookie(
            key="access_token",
            value=tokens["access"],
            **cookie_kwargs,
        )
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh"],
            **cookie_kwargs,
        )

        return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    samesite = auth_cookie_kwargs()["samesite"]
    response = Response({"detail": "Logout realizado com sucesso."})
    response.delete_cookie("access_token", samesite=samesite)
    response.delete_cookie("refresh_token", samesite=samesite)
    return response
