from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from questionnaires.models import TemplateQuestion
from questionnaires.serializers import TemplateQuestionSerializer
from response.models import InspectionResponse

class TemplateQuestionViewSet(viewsets.ModelViewSet):

    serializer_class = TemplateQuestionSerializer
    permission_classes = [IsAuthenticated]

    queryset = (
        TemplateQuestion.objects
        .select_related(
            "question",
            "template_category",
            "template_category__template",
            "template_category__category",
            "question__category",
        )
    )

    lookup_field = "template_question_id"

    ######################################################
    # Create (supports single & multiple questions)
    ######################################################

    def create(self, request, *args, **kwargs):

        questions = request.data.get("questions")

        # Existing single create
        if not questions:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(created_by=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        template = request.data.get("template")
        template_category = request.data.get("template_category")
        start_order = int(request.data.get("order", 1))

        created = []

        for index, question_id in enumerate(questions):

            # Skip duplicates
            if TemplateQuestion.objects.filter(
                template_category_id=template_category,
                question_id=question_id,
            ).exists():
                continue

            obj = TemplateQuestion.objects.create(
                template_id=template,
                template_category_id=template_category,
                question_id=question_id,
                order=start_order + index,
                created_by=request.user,
            )

            created.append(obj)

        serializer = self.get_serializer(created, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    ######################################################

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    ######################################################
    # Questions inside one Template Category
    ######################################################

    @action(detail=False)
    def by_template_category(self, request):

        template_category = request.query_params.get(
            "template_category"
        )

        queryset = (
            self.get_queryset()
            .filter(
                template_category_id=template_category
            )
            .order_by("order")
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    ######################################################
    # Entire template hierarchy
    ######################################################

    @action(detail=False)
    def by_template(self, request):

        template = request.query_params.get("template")

        queryset = (
            self.get_queryset()
            .filter(
                template_category__template_id=template
            )
            .order_by(
                "template_category__order",
                "order",
            )
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response(serializer.data)

    ######################################################
    # Enable / Disable
    ######################################################

    @action(detail=True, methods=["patch"])
    def toggle(self, request, template_question_id=None):

        obj = self.get_object()

        obj.is_disabled = not obj.is_disabled
        obj.updated_by = request.user
        obj.save()

        return Response({
            "is_disabled": obj.is_disabled
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if InspectionResponse.objects.filter(
            template_question=instance
        ).exists():
            return Response(
                {
                    "message": "This question cannot be deleted because it has already been used in an inspection."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.delete()

        return Response(
            {
                "message": "Question deleted successfully."
            },
            status=status.HTTP_200_OK,
        )