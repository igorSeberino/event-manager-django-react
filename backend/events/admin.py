from django.contrib import admin
from .models import Event, Category, SubCategory


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_date", "location", "status", "organizer")
    list_filter = ("status", "event_date")
    search_fields = ("title", "description", "location")
    ordering = ("-event_date",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    search_fields = ("name",)
    list_filter = ("category",)
