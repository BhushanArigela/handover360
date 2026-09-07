import uuid

from django.db import models
from django.contrib.auth import get_user_model

from .question import Question
from .category import Category

User = get_user_model()


class QuestionCategory(models.Model):

    question_category_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="question_categories"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="category_questions"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="questioncategory_created_by"
    )

    updated_at = models.DateTimeField(auto_now=True)

    updated_by = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="questioncategory_updated_by"
    )

    class Meta:
        unique_together = ("question", "category")

    def __str__(self):
        return f"{self.question.question_text[:40]} -> {self.category.name}"