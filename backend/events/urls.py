from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, SubCategoryViewSet

router = DefaultRouter()
router.register(r"events", EventViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"subcategories", SubCategoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
