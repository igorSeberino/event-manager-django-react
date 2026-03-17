from django.contrib import admin

from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "user", "registered_at")
    list_filter = ("event", "registered_at")
    search_fields = ("user__name", "event__title")
