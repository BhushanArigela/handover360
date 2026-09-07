from rest_framework import status
from rest_framework import viewsets

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from questionnaires.models import TemplateCategory
from questionnaires.serializers import TemplateCategorySerializer
from response.models import InspectionResponse

class TemplateCategoryViewSet(viewsets.ModelViewSet):

    queryset = TemplateCategory.objects.select_related(
        "category",
        "template"
    )

    serializer_class = TemplateCategorySerializer

    permission_classes = [IsAuthenticated]
    lookup_field = "template_category_id"
    
    def perform_create(self, serializer):

        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):

        serializer.save(updated_by=self.request.user)

    @action(detail=False)
    def by_template(self,request):

        template = request.query_params.get("template")

        queryset = self.get_queryset().filter(
            template_id=template
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def toggle(self, request, pk=None):

        obj = self.get_object()

        obj.is_enabled = not obj.is_enabled

        obj.updated_by = request.user

        obj.save()

        return Response({
            "is_enabled": obj.is_enabled
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        has_responses = InspectionResponse.objects.filter(
            template_question__template_category=instance
        ).exists()

        if has_responses:
            return Response(
                {
                    "message": "This category cannot be deleted because inspections have already been completed using it."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.delete()

        return Response(
            {
                "message": "Category deleted successfully."
            },
            status=status.HTTP_200_OK,
        )   