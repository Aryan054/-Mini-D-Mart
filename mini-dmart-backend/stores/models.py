from django.db import models

class Store(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    pickup_capacity = models.PositiveIntegerField(default=50, help_text="Max pickup orders per day")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
