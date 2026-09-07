from rest_framework import serializers

from questionnaires.models import Template


class TemplateSerializer(serializers.ModelSerializer):

    parent_template_name = serializers.CharField(
        source="parent_template.name",
        read_only=True
    )
    category_count = serializers.SerializerMethodField()

    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = [
            "template_id",
            "name",
            "property_type",
            "version",
            "parent_template",
            "parent_template_name",
            "is_default",
            "is_active",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
            "category_count",
            "question_count",
        ]
        read_only_fields = (
            "template_id",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        )

    def validate(self, attrs):

        name = attrs.get(
            "name",
            self.instance.name if self.instance else None,
        )

        property_type = attrs.get(
            "property_type",
            self.instance.property_type if self.instance else None,
        )

        version = attrs.get(
            "version",
            self.instance.version if self.instance else 1,
        )

        exists  = Template.objects.filter(
            name=name,
            property_type=property_type,
            version=version,
        )

        if self.instance:
            exists  = exists.exclude(
                template_id=self.instance.template_id
            )

        if exists.exists():
            raise serializers.ValidationError(
                "A template with this name and version already exists."
            )

        return attrs

    def get_category_count(self,obj):
        return obj.template_categories.count()

    def get_question_count(self,obj):
        return obj.template_questions.count()      