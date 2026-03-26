import uuid

from django.db import models


class Event(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendente"
        APPROVED = "APPROVED", "Aprovado"
        REJECTED = "REJECTED", "Rejeitado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    event_date = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    organizer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="events"
    )
    category = models.ForeignKey(
        "events.Category",
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
    )
    subcategory = models.ForeignKey(
        "events.SubCategory",
        on_delete=models.CASCADE,
        related_name="events",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="subcategories"
    )

    def __str__(self):
        return self.name
