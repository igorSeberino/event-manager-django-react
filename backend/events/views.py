from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Event
from .permissions import IsOrganizerOrAdmin, IsOwnerOrAdmin
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrAdmin, IsOwnerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
