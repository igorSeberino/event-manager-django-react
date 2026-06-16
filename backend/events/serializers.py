from rest_framework import serializers
from .models import Event, Category, SubCategory


class EventSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    subcategory = serializers.CharField(source="subcategory.name", read_only=True)
    organizer = serializers.CharField(source="organizer.name", read_only=True)
    organizer_id = serializers.UUIDField(source="organizer.id", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(),
        source="subcategory",
        write_only=True,
        required=False,
        allow_null=True,
    )
    registrations_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [field.name for field in Event._meta.fields] + [
            "category",
            "subcategory",
            "organizer",
            "organizer_id",
            "category_id",
            "subcategory_id",
            "registrations_count",
        ]
        read_only_fields = ["id", "status", "rejection_reason"]

    def get_registrations_count(self, obj):
        count = getattr(obj, "registrations_count", None)
        if count is not None:
            return count
        return obj.registration_set.count()


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
