import json
from decimal import Decimal
from django.contrib import messages  
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.core.files.storage import default_storage
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

from .models import *

# views.py - Updated login_view and logout_view

@ensure_csrf_cookie
@csrf_protect 
def login_view(request):
    """Login page for both admin and customer access"""
    if request.user.is_authenticated:
        # Check if user is admin or customer and redirect accordingly
        if request.user.is_staff or request.user.is_superuser:
            return redirect('menu-page')
        elif hasattr(request.user, 'customer'):
            return redirect('menu-page')
        else:
            return redirect('menu-page')
    
    if request.method == 'POST':
        user_type = request.POST.get('user_type', 'admin')
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not username or not password:
            messages.error(request, 'Please enter both username and password.')
            return render(request, 'login.html')
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user_type == 'admin':
                # Check if user has admin privileges
                if user.is_staff or user.is_superuser:
                    login(request, user)
                    # Store success message in session for toast
                    request.session['toast_message'] = f'Welcome back, {user.username}!'
                    request.session['toast_type'] = 'success'
                    return redirect('menu-page')
                else:
                    messages.error(request, 'You do not have admin privileges.')
                    return render(request, 'login.html')
            
            elif user_type == 'customer':
                # Check if user has a customer profile
                if hasattr(user, 'customer'):
                    login(request, user)
                    # Store success message in session for toast
                    request.session['toast_message'] = f'Welcome back, {user.username}!'
                    request.session['toast_type'] = 'success'
                    return redirect('menu-page')
                else:
                    messages.error(request, 'No customer profile found for this user.')
                    return render(request, 'login.html')
        else:
            messages.error(request, 'Invalid username or password. Please try again.')
            return render(request, 'login.html')
    
    # GET request - show login page
    return render(request, 'login.html')

def logout_view(request):
    """Logout user and redirect to login page"""
    logout(request)
    # Store logout message in session for toast
    request.session['toast_message'] = 'You have been logged out successfully.'
    request.session['toast_type'] = 'info'
    return redirect('menu-page')




def customer_register(request):
    if request.user.is_authenticated:
        return redirect('menu-page')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # Validation
        if not username or not password1 or not password2:
            messages.error(request, 'All fields are required.')
            return render(request, 'customer_register.html')
        
        if password1 != password2:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'customer_register.html')
        
        if len(password1) < 8:
            messages.error(request, 'Password must be at least 8 characters.')
            return render(request, 'customer_register.html')
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken. Please choose another.')
            return render(request, 'customer_register.html')
        
        try:
            # Create user
            user = User.objects.create_user(
                username=username,
                password=password1,
                is_staff=False,
                is_superuser=False
            )
            
            # Create customer profile
            customer = Customer.objects.create(
                user=user
            )
            
            # Log the user in
            login(request, user)
            # Store success message in session for toast
            request.session['toast_message'] = f'Account created successfully! Welcome {username}!'
            request.session['toast_type'] = 'success'
            return redirect('menu-page')
            
        except Exception as e:
            messages.error(request, f'Registration failed: {str(e)}')
            return render(request, 'customer_register.html')
    
    return render(request, 'customer_register.html')


# views.py - Updated menu_page

def menu_page(request):
    is_admin = request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
    
    # Get toast message from session and clear it
    toast_message = request.session.pop('toast_message', None)
    toast_type = request.session.pop('toast_type', None)
    
    # Get language from query parameter, default to English
    lang = request.GET.get('lang', 'en')

    categories_data = []
    categories = Category.objects.all().order_by('name')
    for cat in categories:
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "name_ar": cat.name_ar
        })
    

    foods = Food.objects.select_related("category").order_by("category__name", "name")

    menu_data = []
    for f in foods:
        menu_data.append({
            "id": f.id,
            "category": f.category.name,
            "category_ar": f.category.name_ar if f.category.name_ar else f.category.name,
            "name": f.name,
            "name_ar": f.name_ar if f.name_ar else f.name,
            "description": f.description or "",
            "description_ar": f.description_ar if f.description_ar else f.description,
            "ingredients": f.ingredients or [],
            "ingredients_ar": f.ingredients_ar if f.ingredients_ar else f.ingredients,
            "price": str(f.price),
            "final_price": str(f.final_price) if f.final_price else str(f.price),
            "discount": str(f.discount),
            "images": [i for i in f.images] if f.images else []
        })
    context = {
        'is_admin': is_admin,
        "categories_data": json.dumps(categories_data),
        "menu_data": json.dumps(menu_data),
        "toast_message": toast_message,
        "toast_type": toast_type,
    }
    return render(request, "index.html", context)

def _read_json(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return None

@login_required
@require_POST
@staff_member_required
def api_category_create(request):
    data = _read_json(request)
    if not data or "name" not in data:
        return HttpResponseBadRequest("Invalid payload")

    name = (data["name"] or "").strip()
    if not name:
        return HttpResponseBadRequest("Name required")
    
    name_ar = (data.get("name_ar") or "").strip() or None

    cat, created = Category.objects.get_or_create(
        name=name,
        defaults={'name_ar': name_ar}
    )
    
    # Update Arabic name if category already existed
    if not created and name_ar:
        cat.name_ar = name_ar
        cat.save(update_fields=['name_ar'])
    
    return JsonResponse({
        "ok": True,
        "created": created,
        "name": cat.name,
        "name_ar": cat.name_ar
    })

@login_required
@require_POST
@staff_member_required
def api_category_update(request):
    data = _read_json(request)
    if not data or "old_name" not in data or "new_name" not in data:
        return HttpResponseBadRequest("Invalid payload")

    old_name = (data["old_name"] or "").strip()
    new_name = (data["new_name"] or "").strip()
    if not old_name or not new_name:
        return HttpResponseBadRequest("Both names required")

    try:
        cat = Category.objects.get(name=old_name)
    except Category.DoesNotExist:
        return HttpResponseBadRequest("Category not found")

    cat.name = new_name
    if "name_ar" in data:
        cat.name_ar = (data["name_ar"] or "").strip() or None
    cat.save(update_fields=["name", "name_ar"])
    
    return JsonResponse({
        "ok": True,
        "name": cat.name,
        "name_ar": cat.name_ar
    })

@login_required
@require_POST
@staff_member_required
def api_category_delete(request):
    data = _read_json(request)
    if not data or "name" not in data:
        return HttpResponseBadRequest("Invalid payload")

    name = (data["name"] or "").strip()
    if not name:
        return HttpResponseBadRequest("Name required")

    try:
        cat = Category.objects.get(name=name)
    except Category.DoesNotExist:
        return JsonResponse({"ok": True, "deleted": False})

    try:
        cat.delete()
    except Exception as e:
        return HttpResponseBadRequest(str(e))

    return JsonResponse({"ok": True, "deleted": True})

@require_POST
@login_required
@staff_member_required
def api_food_create(request):
    category_name = (request.POST.get("category") or "").strip()
    name = (request.POST.get("name") or "").strip()
    name_ar = (request.POST.get("name_ar") or "").strip() or None
    description = request.POST.get("description") or ""
    description_ar = request.POST.get("description_ar") or "" or None
    price = request.POST.get("price")
    final_price = request.POST.get("final_price")
    discount = request.POST.get("discount", "0")

    ingredients_raw = request.POST.get("ingredients") or "[]"
    try:
        ingredients = json.loads(ingredients_raw)
    except Exception:
        ingredients = []
    
    ingredients_ar_raw = request.POST.get("ingredients_ar") or "[]"
    try:
        ingredients_ar = json.loads(ingredients_ar_raw)
    except Exception:
        ingredients_ar = []

    if not category_name or not name or price is None:
        return HttpResponseBadRequest("category, name, price required")

    try:
        cat = Category.objects.get(name=category_name)
    except Category.DoesNotExist:
        return HttpResponseBadRequest("Category not found")

    final_price_value = Decimal(str(final_price)) if final_price else Decimal(str(price))

    food = Food(
        category=cat,
        name=name,
        name_ar=name_ar,
        description=description,
        description_ar=description_ar,
        ingredients=ingredients,
        ingredients_ar=ingredients_ar if ingredients_ar else [],
        price=Decimal(str(price)),
        final_price=final_price_value,
        discount=int(discount) if discount else 0,
    )
    
    # Process images
    images = []
    existing_images = json.loads(request.POST.get("existing_images", "[]"))
    images.extend(existing_images)

    if "images" in request.FILES:
        for img in request.FILES.getlist("images"):
            file_path = default_storage.save(f"images/{img.name}", img)
            images.append(f'/media/{file_path}')

    food.images = images
    food.save()

    return JsonResponse({
        "ok": True,
        "food": {
            "id": food.id,
            "category": cat.name,
            "category_ar": cat.name_ar if cat.name_ar else cat.name,
            "name": food.name,
            "name_ar": food.name_ar if food.name_ar else food.name,
            "description": food.description or "",
            "description_ar": food.description_ar if food.description_ar else food.description,
            "ingredients": food.ingredients or [],
            "ingredients_ar": food.ingredients_ar if food.ingredients_ar else food.ingredients,
            "price": str(food.price),
            "final_price": str(food.final_price),
            "discount": str(food.discount),
            "images": food.images
        }
    })

@login_required
@require_POST
@staff_member_required
def api_food_update(request):
    food_id = request.POST.get("id")
    if not food_id:
        return HttpResponseBadRequest("id required")

    try:
        food = Food.objects.select_related("category").get(id=food_id)
    except Food.DoesNotExist:
        return HttpResponseBadRequest("Food not found")

    category_name = (request.POST.get("category") or "").strip()
    if category_name:
        try:
            food.category = Category.objects.get(name=category_name)
        except Category.DoesNotExist:
            return HttpResponseBadRequest("Category not found")

    if "name" in request.POST:
        food.name = (request.POST.get("name") or "").strip()
    if "name_ar" in request.POST:
        food.name_ar = (request.POST.get("name_ar") or "").strip() or None
    if "description" in request.POST:
        food.description = request.POST.get("description") or ""
    if "description_ar" in request.POST:
        food.description_ar = request.POST.get("description_ar") or "" or None
    if "price" in request.POST:
        food.price = Decimal(str(request.POST.get("price")))
    if "final_price" in request.POST:
        food.final_price = Decimal(str(request.POST.get("final_price")))
    if "discount" in request.POST:
        food.discount = int(str(request.POST.get("discount")))

    if "ingredients" in request.POST:
        try:
            food.ingredients = json.loads(request.POST.get("ingredients") or "[]")
        except Exception:
            food.ingredients = []
    
    if "ingredients_ar" in request.POST:
        try:
            food.ingredients_ar = json.loads(request.POST.get("ingredients_ar") or "[]")
        except Exception:
            food.ingredients_ar = []

    # Process images
    existing_images = json.loads(request.POST.get("existing_images", "[]"))
    removed_images = json.loads(request.POST.get("removed_images", "[]"))

    for img_path in removed_images:
        if default_storage.exists(img_path):
            default_storage.delete(img_path)

    images = [img for img in existing_images if img not in removed_images]

    if "images" in request.FILES:
        for img in request.FILES.getlist("images"):
            file_path = default_storage.save(f"images/{img.name}", img)
            images.append(f'/media/{file_path}')

    food.images = images
    food.save()

    return JsonResponse({
        "ok": True,
        "food": {
            "id": food.id,
            "category": food.category.name,
            "category_ar": food.category.name_ar if food.category.name_ar else food.category.name,
            "name": food.name,
            "name_ar": food.name_ar if food.name_ar else food.name,
            "description": food.description or "",
            "description_ar": food.description_ar if food.description_ar else food.description,
            "ingredients": food.ingredients or [],
            "ingredients_ar": food.ingredients_ar if food.ingredients_ar else food.ingredients,
            "price": str(food.price),
            "final_price": str(food.final_price),
            "discount": str(food.discount),
            "images": food.images,
        }
    })

@login_required
@require_POST
@staff_member_required
def api_food_delete(request):
    data = _read_json(request)
    if not data or "id" not in data:
        return HttpResponseBadRequest("Invalid payload")

    food_id = data["id"]
    try:
        food = Food.objects.get(id=food_id)
    except Food.DoesNotExist:
        return JsonResponse({"ok": True, "deleted": False})

    food.delete()
    return JsonResponse({"ok": True, "deleted": True})

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def api_order_create(request):
    """
    Finalize order and save in Order model
    Input: {'items': [{'id': 1, 'quantity': 2, 'name': 'Biryani', 'price': 2.500, 'discount': 10}, ...]}
    """
    try:
        data = json.loads(request.body)
        items_data = data.get('items', [])
        
        if not items_data:
            return JsonResponse({
                'success': False,
                'message': 'Your order is empty'
            }, status=400)
        
        # Build items dict for the order
        items_dict = {}
        total_amount = 0
        total_items = 0
        
        for item in items_data:
            food_id = item.get('id')
            quantity = item.get('quantity', 1)
            name = item.get('name', '')
            price = float(item.get('price', 0))
            discount = int(item.get('discount', 0))
            
            # Try to get full food details from database
            try:
                food = Food.objects.select_related('category').get(id=food_id)
                
                # Calculate discounted price
                discounted_price = float(food.final_price) if food.final_price else float(food.price)
                
                items_dict[str(food_id)] = {
                    'name': food.name,
                    'name_ar': food.name_ar if food.name_ar else food.name,
                    'quantity': quantity,
                    'price': float(food.price),
                    'final_price': float(food.final_price) if food.final_price else float(food.price),
                    'discount': food.discount,
                    'category': food.category.name,
                    'category_ar': food.category.name_ar if food.category.name_ar else food.category.name,
                }
                
                # Add to totals
                total_amount += discounted_price * quantity
                
            except Food.DoesNotExist:
                # Fallback for items not in database
                discounted_price = price * (1 - discount / 100)
                
                items_dict[str(food_id)] = {
                    'name': name,
                    'name_ar': name,
                    'quantity': quantity,
                    'price': price,
                    'final_price': discounted_price,
                    'discount': discount,
                    'category': '',
                    'category_ar': '',
                }
                
                total_amount += discounted_price * quantity
            
            total_items += quantity
        
        # Get or create customer
        customer = None
        if request.user.is_authenticated:
            try:
                customer = Customer.objects.get(user=request.user)
            except Customer.DoesNotExist:
                # Create customer profile if doesn't exist
                customer = Customer.objects.create(user=request.user)
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            items=items_dict,  # Changed from foods to items
            total_items=total_items,
            total_amount=round(total_amount, 3),
            status=OrderStatus.NOT_STARTED,
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Order registered successfully',
            'order_id': order.id,
            'order_date': order.date.isoformat(),
            'total_items': total_items,
            'total_amount': round(total_amount, 3),
            'status': order.status,
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid data format'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error in order registration: {str(e)}'
        }, status=500)

@login_required
@csrf_exempt
@require_http_methods(["GET"])
def get_orders(request):
    """Get list of orders (for management)"""
    try:
        orders = Order.objects.all()[:50]
        
        orders_list = []
        for order in orders:
            orders_list.append({
                'id': order.id,
                'date': order.date,
                'foods': order.foods,
                'total_items': sum(item.get('quantity', 0) for item in order.foods.values()),
                'total_amount': sum(
                    float(item.get('price', 0)) * item.get('quantity', 0) 
                    for item in order.foods.values()
                )
            })
        
        return JsonResponse({
            'success': True,
            'orders': orders_list
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)




# ============================================
# ADMIN ORDER MANAGEMENT VIEWS
# ============================================

@login_required
@staff_member_required
def admin_orders_page(request):
    """
    Admin order management page with modern UI
    """
    is_admin = request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
    
    # Get toast message from session and clear it
    toast_message = request.session.pop('toast_message', None)
    toast_type = request.session.pop('toast_type', None)
    
    context = {
        'is_admin': is_admin,
        'admin_username': request.user.username,
        'toast_message': toast_message,
        'toast_type': toast_type,
        'page_title': 'Order Management',
    }
    
    return render(request, 'admin-panel.html', context)



# ============================================
# ORDER MANAGEMENT APIs
# ============================================

@login_required
@staff_member_required
@require_http_methods(["GET"])
def api_orders_list(request):
    """
    Get all orders with full details for admin panel
    Supports query params: status, search, page, limit
    """
    try:
        # Query parameters
        status_filter = request.GET.get('status', 'all')
        search_query = request.GET.get('search', '').strip()
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        
        # Base queryset with related data
        orders_queryset = Order.objects.select_related('customer', 'customer__user').all()
        
        # Apply status filter
        if status_filter != 'all':
            orders_queryset = orders_queryset.filter(status=status_filter)
        
        # Apply search filter
        if search_query:
            from django.db.models import Q
            orders_queryset = orders_queryset.filter(
                Q(id__icontains=search_query) |
                Q(customer__user__username__icontains=search_query) |
                Q(status__icontains=search_query) |
                Q(notes__icontains=search_query)
            )
        
        # Order by most recent first
        orders_queryset = orders_queryset.order_by('-date')
        
        # Total count before pagination
        total_orders = orders_queryset.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        orders = orders_queryset[offset:offset + limit]
        
        # Serialize orders
        orders_list = []
        for order in orders:
            # Get customer info
            customer_name = "Guest"
            subscription_number = "N/A"
            
            if order.customer and order.customer.user:
                customer_name = order.customer.user.username
                subscription_number = f"SUB-{order.customer.id:04d}"
            elif order.customer:
                subscription_number = f"SUB-{order.customer.id:04d}"
            
            # Format items with full details INCLUDING IMAGES
            items_dict = {}
            for food_id_str, item_data in order.items.items():
                try:
                    food_id = int(food_id_str)
                except (ValueError, TypeError):
                    food_id = None
                
                # Default item data (from stored JSON)
                item_info = {
                    'name': item_data.get('name', 'Unknown'),
                    'name_ar': item_data.get('name_ar', ''),
                    'quantity': item_data.get('quantity', 1),
                    'price': float(item_data.get('price', 0)),
                    'final_price': float(item_data.get('final_price', item_data.get('price', 0))),
                    'discount': item_data.get('discount', 0),
                    'category': item_data.get('category', ''),
                    'category_ar': item_data.get('category_ar', ''),
                    'images': item_data.get('images', []),  # از JSON ذخیره شده
                }
                
                # حالا سعی کن از دیتابیس عکس واقعی غذا رو بگیری
                if food_id:
                    try:
                        food = Food.objects.only('images').get(id=food_id)
                        if food.images:
                            item_info['images'] = list(food.images)
                    except Food.DoesNotExist:
                        pass  # از همون images ذخیره شده توی JSON استفاده کن
                
                items_dict[str(food_id_str)] = item_info
            
            orders_list.append({
                'id': order.id,
                'date': order.date.isoformat(),
                'updated_at': order.updated_at.isoformat() if order.updated_at else None,
                'customer_name': customer_name,
                'subscription_number': subscription_number,
                'status': order.status,
                'items': items_dict,
                'total_items': order.total_items,
                'total_amount': float(order.total_amount),
                'notes': order.notes or '',
            })
        
        return JsonResponse({
            'success': True,
            'orders': orders_list,
            'total': total_orders,
            'page': page,
            'limit': limit,
            'has_more': (offset + limit) < total_orders,
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'message': f'Error fetching orders: {str(e)}'
        }, status=500)

@login_required
@staff_member_required
@require_http_methods(["POST"])
@csrf_exempt
def api_order_update_status(request, order_id):
    """
    Update order status
    """
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if not new_status:
            return JsonResponse({
                'success': False,
                'message': 'Status is required'
            }, status=400)
        
        # Validate status
        valid_statuses = [choice[0] for choice in OrderStatus.choices]
        if new_status not in valid_statuses:
            return JsonResponse({
                'success': False,
                'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=400)
        
        # Get order
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Order not found'
            }, status=404)
        
        # Update status
        old_status = order.status
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        
        return JsonResponse({
            'success': True,
            'message': f'Order #{order_id} status updated from {old_status} to {new_status}',
            'order_id': order_id,
            'old_status': old_status,
            'new_status': new_status,
            'status_display': order.get_status_display(),
            'status_display_ar': order.get_status_display_ar(),
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating order: {str(e)}'
        }, status=500)


@login_required
@staff_member_required
@require_http_methods(["GET"])
def api_orders_stats(request):
    """
    Get order statistics for admin dashboard
    """
    try:
        from django.db.models import Count, Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        # Total counts
        total_orders = Order.objects.count()
        total_customers = Customer.objects.count()
        
        # Orders by status
        status_counts = {}
        for status_choice in OrderStatus.choices:
            status_counts[status_choice[0]] = {
                'count': Order.objects.filter(status=status_choice[0]).count(),
                'label': status_choice[1],
                'label_ar': Order.get_status_display_ar(
                    Order(status=status_choice[0])
                ) if hasattr(Order, 'get_status_display_ar') else status_choice[1]
            }
        
        # Active orders (not finished or cancelled)
        active_orders = Order.objects.filter(
            Q(status='not_started') | Q(status='preparing')
        ).count()
        
        # Revenue stats
        total_revenue = Order.objects.filter(status='finished').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Today's stats
        today = timezone.now().date()
        today_orders = Order.objects.filter(date__date=today).count()
        today_revenue = Order.objects.filter(
            date__date=today, 
            status='finished'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Recent orders (last 7 days)
        last_week = timezone.now() - timedelta(days=7)
        weekly_orders = Order.objects.filter(date__gte=last_week).count()
        
        return JsonResponse({
            'success': True,
            'stats': {
                'total_orders': total_orders,
                'total_customers': total_customers,
                'active_orders': active_orders,
                'total_revenue': float(total_revenue),
                'today_orders': today_orders,
                'today_revenue': float(today_revenue),
                'weekly_orders': weekly_orders,
                'status_breakdown': status_counts,
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching stats: {str(e)}'
        }, status=500)