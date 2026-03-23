from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Event, Category, SubCategory
from .permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin, IsAdminUser
from .serializers import EventSerializer, CategorySerializer, SubCategorySerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrAdmin, IsOwnerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [IsAdminUser]
