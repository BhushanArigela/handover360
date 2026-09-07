from rest_framework import serializers

from questionnaires.models import TemplateCategory


class TemplateCategorySerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    question_count = serializers.SerializerMethodField()

    class Meta:
        model = TemplateCategory
        fields = "__all__"

    def get_question_count(self, obj):
        return obj.questions.count()

    def validate(self, attrs):

        exists = TemplateCategory.objects.filter(
            template=attrs["template"],
            category=attrs["category"]
        )

        if self.instance:
            exists = exists.exclude(pk=self.instance.pk)

        if exists.exists():
            raise serializers.ValidationError(
                "Category already assigned."
            )

        return attrs