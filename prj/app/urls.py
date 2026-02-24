from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.menu_page, name="menu-page"),

    # APIs
    path("api/category/create/", views.api_category_create, name="api-category-create"),
    path("api/category/update/", views.api_category_update, name="api-category-update"),
    path("api/category/delete/", views.api_category_delete, name="api-category-delete"),

    path("api/food/create/", views.api_food_create, name="api-food-create"),
    path("api/food/update/", views.api_food_update, name="api-food-update"),
    path("api/food/delete/", views.api_food_delete, name="api-food-delete"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)