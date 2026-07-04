from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    name_ar = models.CharField(max_length=80, blank=True, null=True, verbose_name="Arabic Name")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
    
    def get_name(self, lang='en'):
        """Return name based on language"""
        if lang == 'ar' and self.name_ar:
            return self.name_ar
        return self.name

class Food(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="foods")

    # English fields (default)
    name = models.CharField(max_length=120)
    name_ar = models.CharField(max_length=120, blank=True, null=True, verbose_name="Arabic Name")
    
    description = models.TextField(blank=True)
    description_ar = models.TextField(blank=True, null=True, verbose_name="Arabic Description")
    
    ingredients = models.JSONField(default=list, blank=True)
    ingredients_ar = models.JSONField(default=list, blank=True, null=True, verbose_name="Arabic Ingredients")
    
    price = models.DecimalField(max_digits=10, decimal_places=3, verbose_name="Original Price")
    final_price = models.DecimalField(max_digits=10, decimal_places=3, verbose_name="Final Price", null=True, blank=True)
    discount = models.IntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ],
        verbose_name="Discount Percentage"
    )

    images = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["category__name", "name"]

    def __str__(self) -> str:
        return self.name
    
    def save(self, *args, **kwargs):
        # محاسبه درصد تخفیف از روی قیمت اولیه و نهایی
        if self.price and self.final_price and self.price > 0:
            if self.final_price < self.price:
                discount_raw = ((self.price - self.final_price) / self.price) * 100
                self.discount = round(discount_raw)
            else:
                self.discount = 0
        elif self.price and self.price > 0:
            self.discount = 0
        
        # اگر final_price نداشتیم، برابر با price قرار بده
        if not self.final_price:
            self.final_price = self.price
            
        super().save(*args, **kwargs)
    
    def get_name(self, lang='en'):
        """Return name based on language"""
        if lang == 'ar' and self.name_ar:
            return self.name_ar
        return self.name
    
    def get_description(self, lang='en'):
        """Return description based on language"""
        if lang == 'ar' and self.description_ar:
            return self.description_ar
        return self.description
    
    def get_ingredients(self, lang='en'):
        """Return ingredients based on language"""
        if lang == 'ar' and self.ingredients_ar:
            return self.ingredients_ar
        return self.ingredients

class Customer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ["-created_at"]
    
    def __str__(self):
        return self.user.username if self.user else "No User"
    
    def get_total_orders(self):
        return self.orders.count()
    
    def get_total_spent(self):
        from django.db.models import Sum
        total = self.orders.filter(
            status='finished'
        ).aggregate(total=Sum('total_amount'))['total']
        return total or 0

class OrderStatus(models.TextChoices):
    NOT_STARTED = 'not_started', 'Not Started'
    PREPARING = 'preparing', 'Preparing'
    FINISHED = 'finished', 'Finished'
    CANCELLED = 'cancelled', 'Cancelled'

class Order(models.Model):
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.PROTECT, 
        related_name="orders",
        null=True,
        blank=True
    )
    date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Order items with quantities and details
    items = models.JSONField(default=dict, blank=True)
    
    # Order totals
    total_items = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    
    # Order status
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.NOT_STARTED
    )
    
    # Additional notes
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-date']

    def __str__(self):
        customer_name = str(self.customer) if self.customer else "Guest"
        return f"Order #{self.id} - {customer_name} - {self.date.strftime('%Y-%m-%d %H:%M')}"
    
    def get_status_display_ar(self):
        """Get Arabic status display"""
        status_map = {
            'not_started': 'لم يبدأ',
            'preparing': 'قيد التحضير',
            'finished': 'منتهي',
            'cancelled': 'ملغي'
        }
        return status_map.get(self.status, self.status)
    
    def update_totals(self):
        """Update total_items and total_amount based on items"""
        self.total_items = sum(item.get('quantity', 0) for item in self.items.values())
        self.total_amount = sum(
            item.get('quantity', 0) * item.get('price', 0) * (1 - (item.get('discount', 0) / 100))
            for item in self.items.values()
        )
        self.save(update_fields=['total_items', 'total_amount'])