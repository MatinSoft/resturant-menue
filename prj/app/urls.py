from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect

# Custom admin site
# class CustomAdminSite(admin.AdminSite):
#     def login(self, request, extra_context=None):
#         # After admin login, redirect to menu-page
#         from django.shortcuts import redirect
#         response = super().login(request, extra_context)
#         if request.user.is_authenticated:
#             return redirect('menu-page')
#         return response

# Create custom admin site instance
# admin_site = CustomAdminSite(name='myadmin')


urlpatterns = [
    path("", views.menu_page, name="menu-page"),
    # path('login/', admin_site.urls),  # Use custom admin
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.customer_register, name='customer_register'),

    # Admin Order Management Page
    path('admin_panel/', views.admin_orders_page, name='admin-panel'),

    # APIs
    path("api/category/create/", views.api_category_create, name="api-category-create"),
    path("api/category/update/", views.api_category_update, name="api-category-update"),
    path("api/category/delete/", views.api_category_delete, name="api-category-delete"),

    path("api/food/create/", views.api_food_create, name="api-food-create"),
    path("api/food/update/", views.api_food_update, name="api-food-update"),
    path("api/food/delete/", views.api_food_delete, name="api-food-delete"),

    path("api/order/create/", views.api_order_create, name="api-order-create"),
    
    # Order Management APIs (NEW)
    path("api/orders/list/", views.api_orders_list, name="api-orders-list"),
    path("api/orders/<int:order_id>/update-status/", views.api_order_update_status, name="api-order-update-status"),
    path("api/orders/stats/", views.api_orders_stats, name="api-orders-stats"),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)