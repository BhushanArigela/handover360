from rest_framework import serializers

from questionnaires.models import Template


class TemplateDropdownSerializer(serializers.ModelSerializer):

    class Meta:
        model = Template
        fields = (
            "template_id",
            "name",
            "property_type",
            "version",
        )