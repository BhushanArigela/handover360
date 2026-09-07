from rest_framework import serializers

from questionnaires.models import (
    Template,
    TemplateCategory,
    TemplateQuestion,
)


class InspectionQuestionSerializer(serializers.ModelSerializer):

    question_text = serializers.SerializerMethodField()

    question_type = serializers.SerializerMethodField()

    required = serializers.SerializerMethodField()

    options_config = serializers.SerializerMethodField()

    placeholder = serializers.SerializerMethodField()

    help_text = serializers.SerializerMethodField()

    class Meta:

        model = TemplateQuestion

        fields = (
            "template_question_id",
            "question_text",
            "question_type",
            "required",
            "options_config",
            "placeholder",
            "help_text",
            "order",
        )

    def get_question_text(self, obj):

        return (
            obj.overridden_text
            if obj.overridden_text
            else obj.question.question_text
        )

    def get_question_type(self, obj):

        return (
            obj.overridden_type
            if obj.overridden_type
            else obj.question.type
        )

    def get_required(self, obj):

        if obj.overridden_required is not None:
            return obj.overridden_required

        return obj.question.required

    def get_options_config(self, obj):

        if obj.overridden_options_config:
            return obj.overridden_options_config

        return obj.question.options_config

    def get_placeholder(self, obj):

        if hasattr(obj, "overridden_placeholder") and obj.overridden_placeholder:
            return obj.overridden_placeholder

        return getattr(obj.question, "placeholder", "")

    def get_help_text(self, obj):

        if hasattr(obj, "overridden_help_text") and obj.overridden_help_text:
            return obj.overridden_help_text

        return getattr(obj.question, "help_text", "")
        

class InspectionCategorySerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name"
    )

    questions = serializers.SerializerMethodField()

    class Meta:

        model = TemplateCategory

        fields = (
            "template_category_id",
            "category_name",
            "order",
            "questions",
        )

    def get_questions(self, obj):

        questions = (

            TemplateQuestion.objects

            .filter(
                template=obj.template,
                template_category=obj,
                is_disabled=False,
            )

            .select_related(
                "question"
            )

            .order_by(
                "order"
            )

        )

        return InspectionQuestionSerializer(
            questions,
            many=True,
        ).data


class InspectionTemplateSerializer(serializers.ModelSerializer):

    categories = serializers.SerializerMethodField()

    class Meta:

        model = Template

        fields = (
            "template_id",
            "name",
            "property_type",
            "version",
            "categories",
        )

    def get_categories(self, obj):

        categories = (

            TemplateCategory.objects

            .filter(
                template=obj,
                is_enabled=True,
            )

            .select_related(
                "category"
            )

            .order_by(
                "order"
            )

        )

        return InspectionCategorySerializer(
            categories,
            many=True,
        ).data