# models/template_category.py

import uuid

from django.db import models
from .base import AuditModel
from .template import Template
from .category import Category

class TemplateCategory(AuditModel):

    template_category_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="template_categories"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="category_templates"
    )

    order = models.IntegerField(default=0)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ("template", "category")