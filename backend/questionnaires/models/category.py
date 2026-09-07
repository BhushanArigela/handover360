# models/category.py

import uuid

from django.db import models
from .base import AuditModel

class Category(AuditModel):
    category_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    parent_category = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children"
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name