from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from . import services
from .models import Event, Category, SubCategory
from .permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin, IsAdminUser
from .serializers import EventSerializer, CategorySerializer, SubCategorySerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related(
        "category", "subcategory", "organizer"
    ).all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrAdmin, IsOwnerOrAdmin]
    filterset_fields = ["status", "category", "subcategory", "organizer"]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["event_date", "title", "capacity"]
    ordering = ["-event_date"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
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
        return Response(self.get_serializer(event).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        event_status = data.pop("status", None)
        event = services.update_event(
            instance=instance,
            acting_user=request.user,
            status=event_status,
            **data,
        )
        return Response(self.get_serializer(event).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

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
