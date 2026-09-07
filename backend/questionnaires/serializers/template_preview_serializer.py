from rest_framework import serializers

from questionnaires.models import (
    Template,
    TemplateCategory,
    TemplateQuestion,
)


class PreviewQuestionSerializer(serializers.ModelSerializer):

    question_text = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    required = serializers.SerializerMethodField()
    options_config = serializers.SerializerMethodField()
    has_scoring = serializers.SerializerMethodField()
    minimum_score = serializers.SerializerMethodField()
    maximum_score = serializers.SerializerMethodField()

    class Meta:

        model = TemplateQuestion

        fields = [
            "template_question_id",
            "question_text",
            "type",
            "required",
            "order",
            "options_config",
            "has_scoring",
            "minimum_score",
            "maximum_score",

        ]

    def get_has_scoring(self, obj):
        return obj.question.has_scoring


    def get_minimum_score(self, obj):
        return obj.question.minimum_score


    def get_maximum_score(self, obj):
        return obj.question.maximum_score

    def get_question_text(self, obj):

        return (
            obj.overridden_text
            or obj.question.question_text
        )

    def get_type(self, obj):

        return (
            obj.overridden_type
            or obj.question.type
        )

    def get_required(self, obj):

        if obj.overridden_required is not None:
            return obj.overridden_required

        return obj.question.required
    
    def get_options_config(self, obj):

        if obj.overridden_options_config:
            return obj.overridden_options_config

        return obj.question.options_config

class PreviewCategorySerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name"
    )

    questions = serializers.SerializerMethodField()

    class Meta:

        model = TemplateCategory

        fields = [
            "template_category_id",
            "category_name",
            "order",
            "questions",
        ]

    def get_questions(self, obj):

        queryset = (
            TemplateQuestion.objects
            .filter(
                template_category=obj,
                is_disabled=False
            )
            .select_related("question")
            .order_by("order")
        )

        return PreviewQuestionSerializer(
            queryset,
            many=True
        ).data

class TemplatePreviewSerializer(serializers.ModelSerializer):

    categories = serializers.SerializerMethodField()

    class Meta:

        model = Template

        fields = [
            "template_id",
            "name",
            "property_type",
            "version",
            "categories",
        ]

    def get_categories(self, obj):

        queryset = (
            TemplateCategory.objects
            .filter(
                template=obj,
                is_enabled=True
            )
            .select_related("category")
            .order_by("order")
        )

        return PreviewCategorySerializer(
            queryset,
            many=True
        ).data        