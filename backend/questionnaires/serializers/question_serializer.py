from rest_framework import serializers
from questionnaires.models import Question


class QuestionSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    options_config = serializers.JSONField(required=False)

    class Meta:
        model = Question
        fields = [
            "question_id",
            "category",
            "category_name",
            "question_text",
            "type",
            "required",
            "help_text",
            "placeholder",
            "has_scoring",
            "minimum_score",
            "maximum_score",
            "options_config",
            "is_active",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        ]

        read_only_fields = (
            "question_id",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        )
    # def get_options_config(self, obj):

    #     if not obj.options_config:
    #         return []

    #     result = []

    #     for opt in obj.options_config:

    #         if isinstance(opt, str):
    #             result.append({
    #                 "text": opt,
    #                 "score": 0
    #             })
    #         else:
    #             result.append({
    #                 "text": opt.get("text", ""),
    #                 "score": opt.get("score", 0)
    #             })

    #     return result
    def to_representation(self, instance):
        data = super().to_representation(instance)

        options = data.get("options_config") or []

        converted = []

        for opt in options:
            if isinstance(opt, str):
                converted.append({
                    "text": opt,
                    "score": 0
                })
            else:
                converted.append({
                    "text": opt.get("text", ""),
                    "score": opt.get("score", 0)
                })

        data["options_config"] = converted
        return data 

    def validate(self, attrs):

        category = attrs.get(
            "category",
            self.instance.category if self.instance else None
        )

        question_text = attrs.get(
            "question_text",
            self.instance.question_text if self.instance else ""
        )

        qs = Question.objects.filter(
            category=category,
            question_text__iexact=question_text
        )

        if self.instance:
            qs = qs.exclude(
                question_id=self.instance.question_id
            )

        if qs.exists():
            raise serializers.ValidationError(
                "Question already exists in this category."
            )

        return attrs    