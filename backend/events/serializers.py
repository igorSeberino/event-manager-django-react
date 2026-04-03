from rest_framework import serializers
from .models import Event, Category, SubCategory


class EventSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    subcategory = serializers.CharField(source="subcategory.name", read_only=True)
    organizer = serializers.CharField(source="organizer.name", read_only=True)

    class Meta:
        model = Event
        fields = [field.name for field in Event._meta.fields] + [
            "category",
            "subcategory",
            "organizer",
        ]
        read_only_fields = ["id"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["id"]


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = "__all__"
        read_only_fields = ["id"]
