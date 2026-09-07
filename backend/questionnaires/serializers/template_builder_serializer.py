from rest_framework import serializers

from questionnaires.models import (
    TemplateCategory,
    TemplateQuestion
)


class TemplateCategorySerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = TemplateCategory
        fields = "__all__"


class TemplateQuestionSerializer(serializers.ModelSerializer):

    question_text = serializers.CharField(
        source="question.question_text",
        read_only=True
    )

    category = serializers.CharField(
        source="question.category.name",
        read_only=True
    )

    class Meta:
        model = TemplateQuestion
        fields = "__all__"