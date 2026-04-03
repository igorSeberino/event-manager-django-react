from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from config.exceptions import PermissionDenied, ValidationError
from config.mixins import ServiceExceptionMixin
from . import services
from .models import Event, Category, SubCategory
from .permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin, IsAdminUser
from .serializers import EventSerializer, CategorySerializer, SubCategorySerializer


class EventViewSet(ServiceExceptionMixin, viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrAdmin, IsOwnerOrAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            event = services.create_event(
                title=data["title"],
                description=data["description"],
                location=data["location"],
                event_date=data["event_date"],
                capacity=data["capacity"],
                organizer=request.user,
                acting_user=request.user,
                category_id=data.get("category_id"),
                subcategory_id=data.get("subcategory_id"),
                status=data.get("status", Event.Status.PENDING),
            )
        except (ValidationError, PermissionDenied) as exc:
            return self.handle_service_error(exc)
        return Response(self.get_serializer(event).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        event_status = data.pop("status", None)
        try:
            event = services.update_event(
                instance=instance,
                acting_user=request.user,
                status=event_status,
                **data,
            )
        except (ValidationError, PermissionDenied) as exc:
            return self.handle_service_error(exc)
        return Response(self.get_serializer(event).data)


class CategoryViewSet(ServiceExceptionMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            category = services.create_category(
                name=serializer.validated_data["name"],
                acting_user=request.user,
            )
        except ValidationError as exc:
            return self.handle_service_error(exc)
        return Response(
            self.get_serializer(category).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        try:
            category = services.update_category(
                instance=instance,
                name=serializer.validated_data["name"],
                acting_user=request.user,
            )
        except ValidationError as exc:
            return self.handle_service_error(exc)
        return Response(self.get_serializer(category).data)


class SubCategoryViewSet(ServiceExceptionMixin, viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            subcategory = services.create_subcategory(
                name=data["name"],
                category_id=data["category"].id,
                acting_user=request.user,
            )
        except ValidationError as exc:
            return self.handle_service_error(exc)
        return Response(
            self.get_serializer(subcategory).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        try:
            subcategory = services.update_subcategory(
                instance=instance,
                name=serializer.validated_data["name"],
                acting_user=request.user,
            )
        except ValidationError as exc:
            return self.handle_service_error(exc)
        return Response(self.get_serializer(subcategory).data)
