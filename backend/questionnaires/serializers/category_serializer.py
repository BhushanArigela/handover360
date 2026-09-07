from rest_framework import serializers
from questionnaires.models import Category


class CategorySerializer(serializers.ModelSerializer):

    parent_category_name = serializers.CharField(
        source="parent_category.name",
        read_only=True
    )

    class Meta:
        model = Category
        fields = [
            "category_id",
            "name",
            "description",
            "parent_category",
            "parent_category_name",
            "is_active",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        ]
        read_only_fields = (
            "category_id",
            "created_at",
            "created_by",
            "updated_at",
            "updated_by",
        )