# models/template_question.py

import uuid

from django.db import models
from .base import AuditModel
from .template import Template
from .template_category import TemplateCategory
from .question import Question

class TemplateQuestion(AuditModel):

    template_question_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="template_questions"
    )
    template_category = models.ForeignKey(
        TemplateCategory,
        on_delete=models.CASCADE,
        related_name="template_questions",
        null=True,
        blank=True,
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="template_overrides"
    )

    overridden_text = models.TextField(null=True, blank=True)
    overridden_type = models.CharField(max_length=30, null=True, blank=True)

    overridden_required = models.BooleanField(null=True, blank=True)
    overridden_help_text = models.TextField(null=True, blank=True)
    overridden_placeholder = models.CharField(max_length=255, null=True, blank=True)

    overridden_options_config = models.JSONField(null=True, blank=True)

    is_disabled = models.BooleanField(default=False)

    order = models.IntegerField(default=0)

    class Meta:
        unique_together = ("template_category", "question")