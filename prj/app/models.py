from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Food(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="foods")

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    ingredients = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    image = models.ImageField(upload_to="foods/", blank=True, null=True)


    class Meta:
        ordering = ["category__name", "name"]

    def __str__(self) -> str:
        return self.name