# models/template.py

import uuid

from django.db import models
from .base import AuditModel

class Template(AuditModel):

    PROPERTY_TYPES = (
        ("residential_apartment", "Residential Apartment"),
        ("independent_villa", "Independent Villa"),
        ("independent_house", "Independent House"),
        ("row_house", "Row House"),
        ("commercial_building", "Commercial Building"),
        ("industrial_structure", "Industrial Structure"),
        ("other", "Other"),
    )

    template_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255)
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPES)
    version = models.PositiveIntegerField(default=1)
    is_default = models.BooleanField(default=False)

    parent_template = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children"
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name", "version"]

        unique_together = (
            "name",
            "property_type",
            "version",
        )

        indexes = [
            models.Index(fields=["property_type"]),
            models.Index(fields=["is_active"]),
        ] 