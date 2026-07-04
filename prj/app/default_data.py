import os
import sys
import json
from decimal import Decimal
from pathlib import Path

# -----------------------------------------
# Django bootstrap (for direct execution)
# -----------------------------------------
THIS_FILE = Path(__file__).resolve()

# If the file is inside app/, parents[1] becomes the project root (where manage.py is)
PROJECT_ROOT = THIS_FILE.parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "prj.settings")

import django
django.setup()

# Import after setup
from django.db import transaction
from app.models import Category, Food

# -----------------------------------------
# Paths
# -----------------------------------------
# JSON file path
SEED_JSON = PROJECT_ROOT / "app" / "foods.json"  # If JSON is in app folder
# If JSON is in project root, use this:
# SEED_JSON = PROJECT_ROOT / "foods.json"

# Images directory path
IMAGES_DIR = PROJECT_ROOT / "media" / "images"

def dec3(x) -> Decimal:
    """Convert to Decimal with 3 decimal places"""
    return Decimal(str(x)).quantize(Decimal("0.000"))

@transaction.atomic
def run():
    """Read JSON and save to database with bilingual support"""
    
    # Check if JSON file exists
    if not SEED_JSON.exists():
        print(f"❌ JSON file not found: {SEED_JSON}")
        print(f"Please set the correct path in the code")
        return
    
    with open(SEED_JSON, "r", encoding="utf-8") as f:
        items = json.load(f)

    created_foods = 0
    updated_foods = 0
    created_categories = 0
    updated_categories = 0

    print(f"\n📦 Processing {len(items)} items...")
    print("-" * 50)

    for it in items:
        # Extract data from JSON - bilingual support
        cat_name = (it.get("category") or "Uncategorized").strip()
        cat_name_ar = (it.get("category_ar") or "").strip() or None
        
        name = (it.get("name") or "").strip()
        name_ar = (it.get("name_ar") or "").strip() or None
        
        if not name:
            print(f"⚠️ Item without name: {it}")
            continue

        # Get or create category with Arabic name support
        category, cat_created = Category.objects.get_or_create(
            name=cat_name,
            defaults={"name_ar": cat_name_ar}
        )
        
        # If category exists but doesn't have Arabic name, update it
        if not cat_created and cat_name_ar and not category.name_ar:
            category.name_ar = cat_name_ar
            category.save(update_fields=["name_ar"])
            updated_categories += 1
            print(f"🔄 Updated Arabic name for category: {cat_name}" + 
                  (f" → {cat_name_ar}" if cat_name_ar else ""))
        elif cat_created:
            created_categories += 1
            print(f"✅ Created new category: {cat_name}" + 
                  (f" ({cat_name_ar})" if cat_name_ar else ""))

        # Fix image paths - add /media/images/ prefix to file names
        original_images = it.get("images") or []
        fixed_images = []
        
        for img in original_images:
            # If path is not complete, add media path
            if not img.startswith('/') and not img.startswith('http'):
                # Build complete path for images
                fixed_path = f"/media/images/{img}"
                fixed_images.append(fixed_path)
            else:
                fixed_images.append(img)
        
        # Process ingredients with bilingual support
        ingredients = it.get("ingredients") or []
        ingredients_ar = it.get("ingredients_ar") or []
        
        # If Arabic ingredients is empty, copy English ingredients as default
        if not ingredients_ar and ingredients:
            ingredients_ar = ingredients.copy()
        
        # Food data
        food_data = {
            "category": category,
            "name": name,
            "name_ar": name_ar,
            "description": it.get("description") or "",
            "description_ar": it.get("description_ar") or it.get("description") or "",
            "ingredients": ingredients,
            "ingredients_ar": ingredients_ar,
            "price": dec3(it.get("price") or "0.000"),
            "discount": int(it.get("discount") or 0),
            "images": fixed_images,  # Using fixed paths
        }

        # Create or update food
        food, created = Food.objects.get_or_create(
            category=category,
            name=name,
            defaults=food_data
        )

        if not created:
            # Update existing data
            food.description = food_data["description"]
            food.description_ar = food_data["description_ar"]
            food.ingredients = food_data["ingredients"]
            food.ingredients_ar = food_data["ingredients_ar"]
            food.price = food_data["price"]
            food.discount = food_data["discount"]
            food.images = food_data["images"]
            
            # Update Arabic name if provided
            if name_ar:
                food.name_ar = name_ar
            
            food.save()
            updated_foods += 1
            status = f"🔄 Updated: {name}"
            if name_ar and name_ar != name:
                status += f" ({name_ar})"
            print(status)
        else:
            created_foods += 1
            status = f"✅ Created: {name}"
            if name_ar and name_ar != name:
                status += f" ({name_ar})"
            print(status)

    print("-" * 50)
    print(f"\n✅ Operation completed successfully!")
    print(f"\n📊 Statistics:")
    print(f"   - New categories created: {created_categories}")
    print(f"   - Categories updated (Arabic names): {updated_categories}")
    print(f"   - New foods created: {created_foods}")
    print(f"   - Foods updated: {updated_foods}")
    print(f"   - Total items in file: {len(items)}")
    print(f"   - Total categories: {Category.objects.count()}")
    print(f"   - Total foods in database: {Food.objects.count()}")
    
    # Bilingual statistics
    foods_with_arabic = Food.objects.exclude(name_ar__isnull=True).exclude(name_ar='').count()
    cats_with_arabic = Category.objects.exclude(name_ar__isnull=True).exclude(name_ar='').count()
    
    print(f"\n🌐 Bilingual Coverage:")
    print(f"   - Foods with Arabic names: {foods_with_arabic}/{Food.objects.count()}")
    print(f"   - Categories with Arabic names: {cats_with_arabic}/{Category.objects.count()}")
    
    if IMAGES_DIR.exists():
        print(f"\n💡 Note: Images should be placed in: {IMAGES_DIR}")
        print(f"   Image paths stored as: /media/images/filename.jpg")

def check_images():
    """Check if images exist in the specified path"""
    print(f"\n📁 Checking images in: {IMAGES_DIR}")
    
    if not IMAGES_DIR.exists():
        print(f"❌ Images directory not found: {IMAGES_DIR}")
        print(f"   Please create the directory and place images there")
        print(f"   Expected path: {IMAGES_DIR}")
        print(f"   Image paths in JSON will be: /media/images/filename.jpg")
        return
    
    # Check for various image formats
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.gif']:
        image_files.extend(list(IMAGES_DIR.glob(ext)))
    
    print(f"✅ Found {len(image_files)} images")
    
    if image_files:
        print(f"   Sample: {image_files[0].name}")
        # Show file extensions found
        extensions = set(f.suffix for f in image_files)
        print(f"   Formats found: {', '.join(extensions)}")
    else:
        print(f"   ⚠️ No image files found")
        print(f"   Supported formats: .jpg, .jpeg, .png, .webp, .gif")

def validate_data():
    """Validate JSON data before import"""
    if not SEED_JSON.exists():
        print(f"❌ JSON file not found: {SEED_JSON}")
        return False
    
    with open(SEED_JSON, "r", encoding="utf-8") as f:
        items = json.load(f)
    
    print(f"\n🔍 Validating {len(items)} items...")
    
    errors = []
    warnings = []
    has_arabic = False
    items_with_arabic = 0
    items_with_discount = 0
    
    for idx, it in enumerate(items):
        item_num = idx + 1
        
        # Check required fields
        if not it.get("name"):
            errors.append(f"Item {item_num}: Name (name) is empty")
        
        if not it.get("category"):
            errors.append(f"Item {item_num}: Category is empty")
        
        if "price" not in it or it["price"] is None:
            errors.append(f"Item {item_num}: Price is not specified")
        
        # Check Arabic fields
        if it.get("name_ar"):
            has_arabic = True
            items_with_arabic += 1
        else:
            warnings.append(f"Item {item_num}: No Arabic name (name_ar) - will use English name")
        
        if it.get("description_ar"):
            has_arabic = True
        
        # Check for discount
        discount = it.get("discount", 0)
        if discount and int(discount) > 0:
            items_with_discount += 1
        
        # Check negative price
        try:
            price = float(it.get("price", 0))
            if price < 0:
                errors.append(f"Item {item_num}: Negative price ({price})")
        except (ValueError, TypeError):
            errors.append(f"Item {item_num}: Invalid price format")
        
        # Check discount range
        discount = it.get("discount", 0)
        try:
            discount = int(discount)
            if discount < 0 or discount > 100:
                errors.append(f"Item {item_num}: Discount must be between 0-100 (current: {discount})")
        except (ValueError, TypeError):
            errors.append(f"Item {item_num}: Invalid discount format")
    
    # Display results
    print(f"\n📊 Validation Summary:")
    print(f"   - Total items: {len(items)}")
    print(f"   - Items with Arabic translation: {items_with_arabic}")
    print(f"   - Items with discount: {items_with_discount}")
    
    if warnings:
        print(f"\n⚠️ {len(warnings)} Warning(s):")
        for warning in warnings[:5]:  # Show first 5 warnings
            print(f"   - {warning}")
        if len(warnings) > 5:
            print(f"   ... and {len(warnings) - 5} more warning(s)")
    
    if errors:
        print(f"\n❌ {len(errors)} Error(s) found:")
        for error in errors:
            print(f"   - {error}")
        return False
    
    print(f"\n✅ All {len(items)} items are valid")
    if has_arabic:
        print(f"✅ Arabic translations found in {items_with_arabic}/{len(items)} items")
    else:
        print("⚠️ No Arabic data found - Will copy English values as default")
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("🍽️  Restaurant Menu Data Import Tool")
    print("=" * 50)
    
    # Check if images exist
    check_images()
    
    # Validate data
    if not validate_data():
        print("\n❌ Please fix the errors and try again")
        sys.exit(1)
    
    # Run main operation
    run()
    
    # Display sample data from database for verification
    print(f"\nSample of stored data:")
    print("-" * 50)
    foods = Food.objects.all()[:3]
    for i, food in enumerate(foods, 1):
        print(f"\n{i}. {food.name}")
        if food.name_ar and food.name_ar != food.name:
            print(f"   Arabic: {food.name_ar}")
        print(f"   Category: {food.category.name}" + 
              (f" ({food.category.name_ar})" if food.category.name_ar and food.category.name_ar != food.category.name else ""))
        print(f"   Price: {food.price} OMR")
        print(f"   Images: {len(food.images)} image(s)")
        if food.ingredients:
            print(f"   Ingredients: {', '.join(food.ingredients[:3])}" + 
                  ("..." if len(food.ingredients) > 3 else ""))
        if food.ingredients_ar and food.ingredients_ar != food.ingredients:
            print(f"   Arabic Ingredients: {', '.join(food.ingredients_ar[:3])}" + 
                  ("..." if len(food.ingredients_ar) > 3 else ""))
    
    print("\n" + "=" * 50)
    print("✅ Import completed successfully!")
    print("=" * 50)