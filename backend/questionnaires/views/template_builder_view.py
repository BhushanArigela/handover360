from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from questionnaires.models import (
    TemplateCategory,
    TemplateQuestion,
)

from questionnaires.serializers import (
    TemplateCategorySerializer,
    TemplateQuestionSerializer,
)

class TemplateCategoryViewSet(viewsets.ModelViewSet):

    serializer_class = TemplateCategorySerializer

    permission_classes = [IsAuthenticated]

    queryset = TemplateCategory.objects.select_related(
        "template",
        "category",
    )

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):

        serializer.save(
            updated_by=self.request.user
        )
    
    def create(self, request, *args, **kwargs):

        template = request.data.get("template")

        category = request.data.get("category")

        exists = TemplateCategory.objects.filter(
            template_id=template,
            category_id=category
        ).exists()

        if exists:

            return Response(
                {
                    "message":
                    "Category already assigned."
                },
                status=400
            )

        return super().create(
            request,
            *args,
            **kwargs
        )
        
    @action(detail=True, methods=["patch"] )
    def toggle(self, request, pk=None):

        obj = self.get_object()

        obj.is_enabled = not obj.is_enabled

        obj.updated_by = request.user

        obj.save()

        return Response({
            "is_enabled": obj.is_enabled
        }) 

    @action(detail=False, methods=["post"] )
    def reorder(self, request):

        items = request.data

        for index, row in enumerate(items):

            TemplateCategory.objects.filter(
                pk=row["id"]
            ).update(
                order=index
            )

        return Response(
            {
                "message":
                "Category order updated."
            }
        )
    
    @action(detail=False, methods=["get"])
    def by_template(self, request):

        template = request.GET.get("template")

        qs = self.queryset.filter(
            template_id=template
        ).order_by("order")

        serializer = self.get_serializer(
            qs,
            many=True
        )

        return Response(serializer.data)
        
class TemplateQuestionViewSet(viewsets.ModelViewSet):

    serializer_class = TemplateQuestionSerializer

    permission_classes = [IsAuthenticated]

    queryset = TemplateQuestion.objects.select_related(
        "template",
        "template_category",
        "template_category__category",
        "question",
        "question__category",
    )    
    
    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):

        serializer.save(
            updated_by=self.request.user
        )
        
    def create(self, request, *args, **kwargs):

        template = request.data.get("template")

        question = request.data.get("question")

        exists = TemplateQuestion.objects.filter(
            template_id=template,
            question_id=question
        ).exists()

        if exists:

            return Response(
                {
                    "message":
                    "Question already assigned."
                },
                status=400
            )

        return super().create(
            request,
            *args,
            **kwargs
        )
        
    @action(detail=True, methods=["patch"] )
    def toggle(self, request, pk=None):

        obj = self.get_object()

        obj.is_disabled = not obj.is_disabled

        obj.updated_by = request.user

        obj.save()

        return Response(
            {
                "is_disabled":
                obj.is_disabled
            }
        ) 
            
    @action(
        detail=False,
        methods=["post"]
    )

    def reorder(self, request):

        items = request.data

        for index, row in enumerate(items):

            TemplateQuestion.objects.filter(
                pk=row["id"]
            ).update(
                order=index
            )

        return Response(
            {
                "message":
                "Order updated."
            }
        )         
        
    @action(
        detail=False,
        methods=["get"]
    )

    def by_template(self, request):

        template = request.GET.get("template")

        qs = self.queryset.filter(
            template_id=template
        ).order_by(
            "question__category__name",
            "order"
        )

        serializer = self.get_serializer(
            qs,
            many=True
        )

        return Response(serializer.data)     