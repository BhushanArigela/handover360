# models/question.py

import uuid

from django.db import models
from .base import AuditModel
from .category import Category

class Question(AuditModel):

    QUESTION_TYPES = (
        ("text", "Text"),
        ("textarea", "Textarea"),
        ("rating", "Rating"),
        ("yes_no", "Yes No"),
        ("multiple_choice", "Multiple Choice"),
        ("photo", "Photo"),
        ("video", "Video"),
        ("dropdown", "Dropdown"),
        ("checkbox", "Checkbox"),
    )

    question_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="questions"
    )
    question_text = models.TextField()
    type = models.CharField(max_length=30, choices=QUESTION_TYPES)

    required = models.BooleanField(default=True)
    help_text = models.TextField(null=True, blank=True)
    placeholder = models.CharField(max_length=255, null=True, blank=True)

    has_scoring = models.BooleanField(default=False)
    minimum_score = models.IntegerField(default=0)
    maximum_score = models.IntegerField(default=10)

    options_config = models.JSONField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.question_text[:50]