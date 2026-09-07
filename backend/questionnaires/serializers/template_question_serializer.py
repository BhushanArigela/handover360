from rest_framework import serializers

from questionnaires.models import TemplateQuestion


class TemplateQuestionSerializer(serializers.ModelSerializer):

    question_text = serializers.CharField(
        source="question.question_text",
        read_only=True,
    )

    question_type = serializers.CharField(
        source="question.type",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="template_category.category.name",
        read_only=True,
    )

    options_config = serializers.SerializerMethodField()
    has_scoring = serializers.SerializerMethodField()
    minimum_score = serializers.SerializerMethodField()
    maximum_score = serializers.SerializerMethodField()
    required = serializers.SerializerMethodField()

    class Meta:
        model = TemplateQuestion

        fields = [
            "template_question_id",
            "template",
            "template_category",
            # "template_category_name",

            "question",
            "questions",
            "question_text",
            "question_type",
            "category_name",
            "options_config",
            "has_scoring",
            "minimum_score",
            "maximum_score",
            "required",
            "order",

            "is_disabled",

            "overridden_text",
            "overridden_type",
            "overridden_required",
            "overridden_help_text",
            "overridden_placeholder",
            "overridden_options_config",

            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "template_question_id",
            "created_at",
            "updated_at",
        )

    def get_options_config(self, obj):
        if obj.overridden_options_config:
            return obj.overridden_options_config

        return obj.question.options_config or []


    def get_has_scoring(self, obj):
        return obj.question.has_scoring


    def get_minimum_score(self, obj):
        return obj.question.minimum_score


    def get_maximum_score(self, obj):
        return obj.question.maximum_score


    def get_required(self, obj):
        if obj.overridden_required is not None:
            return obj.overridden_required

        return obj.question.required
    
    def validate(self, attrs):

        template_category = attrs.get(
            "template_category",
            getattr(self.instance, "template_category", None),
        )

        question = attrs.get(
            "question",
            getattr(self.instance, "question", None),
        )

        if template_category and question:

            exists = TemplateQuestion.objects.filter(
                template_category=template_category,
                question=question,
            )

            if self.instance:
                exists = exists.exclude(
                    pk=self.instance.pk,
                )

            if exists.exists():
                raise serializers.ValidationError(
                    "Question already exists in this category."
                )

        return attrs