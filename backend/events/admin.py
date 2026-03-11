from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_date", "location", "status", "organizer")
    list_filter = ("status", "event_date")
    search_fields = ("title", "description", "location")
    ordering = ("-event_date",)
