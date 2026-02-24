import os
import sys
import json
from decimal import Decimal
from pathlib import Path

# -----------------------------------------
# Django bootstrap (برای اجرای مستقیم)
# -----------------------------------------
THIS_FILE = Path(__file__).resolve()

# اگر فایل داخل app/ هست، parents[1] میشه ریشه پروژه (جایی که manage.py هست)
PROJECT_ROOT = THIS_FILE.parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "prj.settings")

import django
django.setup()

# بعد از setup ایمپورت کن
from django.core.files import File
from django.db import transaction
from app.models import Category, Food

# -----------------------------------------
# Paths
# -----------------------------------------
SEED_JSON = PROJECT_ROOT / "app" / "rydan_menu_seed.json"
IMAGES_DIR = PROJECT_ROOT / "app" / "rydan_images"

def dec3(x) -> Decimal:
    return Decimal(str(x)).quantize(Decimal("0.000"))

@transaction.atomic
def run():
    with open(SEED_JSON, "r", encoding="utf-8") as f:
        items = json.load(f)

    created_foods = 0

    for it in items:
        cat_name = (it.get("category") or "Uncategorized").strip()
        name = (it.get("name") or "").strip()
        if not name:
            continue

        cat, _ = Category.objects.get_or_create(name=cat_name)

        food, created = Food.objects.get_or_create(
            category=cat,
            name=name,
            defaults={
                "description": it.get("description") or "",
                "ingredients": [],
                "price": dec3(it.get("price_omr") or "0.000"),
            },
        )

        if not created:
            if it.get("description"):
                food.description = it["description"]
            if it.get("price_omr"):
                food.price = dec3(it["price_omr"])
            food.save()

        rel_img = it.get("image_path")
        if rel_img:
            # image_path داخل json معمولاً مثل "rydan_images/xxx.jpg" است
            img_path = (PROJECT_ROOT / "app" / rel_img).resolve()
            if img_path.exists():
                with open(img_path, "rb") as img_f:
                    food.image.save(img_path.name, File(img_f), save=True)

        if created:
            created_foods += 1

    print(f"Done. Created foods: {created_foods} / total in file: {len(items)}")

if __name__ == "__main__":
    run()