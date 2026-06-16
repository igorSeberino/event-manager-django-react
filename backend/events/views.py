from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from . import services
from .models import Event, Category, SubCategory
from .permissions import IsOrganizerOrAdmin, IsEventOwner, IsAdminUser
from .serializers import EventSerializer, CategorySerializer, SubCategorySerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = (
        Event.objects.select_related("category", "subcategory", "organizer")
        .annotate(registrations_count=Count("registration"))
        .all()
    )
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["status", "category", "subcategory", "organizer"]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["event_date", "title", "capacity"]
    ordering = ["-event_date"]

    def get_permissions(self):
        if self.action in ("approve", "reject"):
            return [IsAdminUser()]
        if self.action in (
            "update",
            "partial_update",
            "destroy",
            "resubmit",
            "close",
        ):
            return [IsAuthenticated(), IsEventOwner()]
        if self.action == "create":
            return [IsOrganizerOrAdmin()]
        return [AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        category = data.get("category")
        subcategory = data.get("subcategory")
        event = services.create_event(
            title=data["title"],
            description=data["description"],
            location=data["location"],
            event_date=data["event_date"],
            capacity=data["capacity"],
            organizer=request.user,
            acting_user=request.user,
            category_id=category.id if category else None,
            subcategory_id=subcategory.id if subcategory else None,
            status=data.get("status", Event.Status.PENDING),
        )
        return Response(self.get_serializer(event).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        event = services.update_event(
            instance=instance,
            acting_user=request.user,
            **serializer.validated_data,
        )
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, *args, **kwargs):
        event = services.approve_event(
            instance=self.get_object(), acting_user=request.user
        )
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, *args, **kwargs):
        event = services.reject_event(
            instance=self.get_object(),
            acting_user=request.user,
            reason=request.data.get("reason", ""),
        )
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"])
    def resubmit(self, request, *args, **kwargs):
        event = services.resubmit_event(
            instance=self.get_object(), acting_user=request.user
        )
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"])
    def close(self, request, *args, **kwargs):
        event = services.close_event(
            instance=self.get_object(), acting_user=request.user
        )
        return Response(self.get_serializer(event).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = services.create_category(
            name=serializer.validated_data["name"],
            acting_user=request.user,
        )
        return Response(
            self.get_serializer(category).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        category = services.update_category(
            instance=instance,
            name=serializer.validated_data["name"],
            acting_user=request.user,
        )
        return Response(self.get_serializer(category).data)


class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        subcategory = services.create_subcategory(
            name=data["name"],
            category_id=data["category"].id,
            acting_user=request.user,
        )
        return Response(
            self.get_serializer(subcategory).data, status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        subcategory = services.update_subcategory(
            instance=instance,
            name=serializer.validated_data["name"],
            acting_user=request.user,
        )
        return Response(self.get_serializer(subcategory).data)
