import json
from decimal import Decimal

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .models import Category, Food


def menu_page(request):
    categories_data = list(
        Category.objects.order_by("name").values_list("name", flat=True)
    )

    foods = Food.objects.select_related("category").order_by("category__name", "name")

    menu_data = []
    for f in foods:
        menu_data.append(
            {
                "id": f.id,
                "category": f.category.name,
                "name": f.name,
                "description": f.description or "",
                "ingredients": f.ingredients or [],
                "price": str(f.price),
                "image_url": f.image.url if f.image else None,
            }
        )

    return render(
        request,
        "index_en.html",
        {
            "categories_data": categories_data,
            "menu_data": menu_data,
        },
    )


def _read_json(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return None


@require_POST
@staff_member_required
def api_category_create(request):
    data = _read_json(request)
    if not data or "name" not in data:
        return HttpResponseBadRequest("Invalid payload")

    name = (data["name"] or "").strip()
    if not name:
        return HttpResponseBadRequest("Name required")

    cat, created = Category.objects.get_or_create(name=name)
    return JsonResponse({"ok": True, "created": created, "name": cat.name})


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

    # اگر new_name قبلاً وجود داشته باشد، unique constraint می‌خورد
    cat.name = new_name
    cat.save(update_fields=["name"])
    return JsonResponse({"ok": True, "name": cat.name})


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

    # چون Food.category = PROTECT است، اگر غذا داشته باشد حذف نمی‌شود
    try:
        cat.delete()
    except Exception as e:
        return HttpResponseBadRequest(str(e))

    return JsonResponse({"ok": True, "deleted": True})


@require_POST
@staff_member_required
def api_food_create(request):
    category_name = (request.POST.get("category") or "").strip()
    name = (request.POST.get("name") or "").strip()
    description = request.POST.get("description") or ""
    price = request.POST.get("price")

    ingredients_raw = request.POST.get("ingredients") or "[]"
    try:
        ingredients = json.loads(ingredients_raw)
    except Exception:
        ingredients = []

    if not category_name or not name or price is None:
        return HttpResponseBadRequest("category, name, price required")

    try:
        cat = Category.objects.get(name=category_name)
    except Category.DoesNotExist:
        return HttpResponseBadRequest("Category not found")

    food = Food(
        category=cat,
        name=name,
        description=description,
        ingredients=ingredients,
        price=Decimal(str(price)),
    )

    # فایل
    if "image" in request.FILES:
        food.image = request.FILES["image"]

    food.save()

    return JsonResponse({
        "ok": True,
        "food": {
            "id": food.id,
            "category": cat.name,
            "name": food.name,
            "description": food.description or "",
            "ingredients": food.ingredients or [],
            "price": str(food.price),
            "image_url": food.image.url if food.image else None,
        }
    })

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
    if "description" in request.POST:
        food.description = request.POST.get("description") or ""
    if "price" in request.POST:
        food.price = Decimal(str(request.POST.get("price")))

    if "ingredients" in request.POST:
        try:
            food.ingredients = json.loads(request.POST.get("ingredients") or "[]")
        except Exception:
            food.ingredients = []

    # فایل جدید اگر انتخاب شد
    if "image" in request.FILES:
        food.image = request.FILES["image"]

    food.save()

    return JsonResponse({
        "ok": True,
        "food": {
            "id": food.id,
            "category": food.category.name,
            "name": food.name,
            "description": food.description or "",
            "ingredients": food.ingredients or [],
            "price": str(food.price),
            "image_url": food.image.url if food.image else None,
        }
    })

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
