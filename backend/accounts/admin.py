from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("name", "email", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("name", "email")
    ordering = ("email",)
