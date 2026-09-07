from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.db import transaction

from questionnaires.models import Template, TemplateCategory, TemplateQuestion, Category, Question, QuestionCategory
from questionnaires.serializers import TemplateSerializer, TemplatePreviewSerializer, TemplateDropdownSerializer


class TemplateViewSet(viewsets.ModelViewSet):

    serializer_class = TemplateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "template_id"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


    @action(detail=True, methods=["patch"])
    def toggle(self, request, template_id=None):

        template = self.get_object()

        template.is_active = not template.is_active
        template.updated_by = request.user
        template.save()

        return Response(
            {
                "message": "Status updated successfully.",
                "is_active": template.is_active,
            },
            status=status.HTTP_200_OK,
        )        
    

    @action(detail=False, methods=["get"])
    def dropdown(self, request):

        templates = (
            Template.objects.filter(is_active=True)
            .order_by("name")
            .values(
                "template_id",
                "name",
            )
        )

        return Response(templates)
    
    @action(detail=True, methods=["post"])
    def clone(self, request, template_id=None):

        parent = self.get_object()

        latest = (
            Template.objects.filter(
                name=parent.name,
                property_type=parent.property_type,
            )
            .order_by("-version")
            .first()
        )

        version = latest.version + 1 if latest else 1

        with transaction.atomic():

            cloned = Template.objects.create(
                name=parent.name,
                property_type=parent.property_type,
                version=version,
                parent_template=parent,
                is_default=False,
                created_by=request.user,
            )

            template_category_map = {}

            # Clone Template Categories (reuse same Category)
            parent_categories = (
                TemplateCategory.objects
                .filter(template=parent)
                .select_related("category")
                .order_by("order")
            )

            for old_tc in parent_categories:

                new_tc = TemplateCategory.objects.create(
                    template=cloned,
                    category=old_tc.category,          # SAME CATEGORY
                    order=old_tc.order,
                    is_enabled=old_tc.is_enabled,
                    created_by=request.user,
                )

                template_category_map[
                    old_tc.template_category_id
                ] = new_tc

            # Clone Template Questions (reuse same Question)
            parent_questions = (
                TemplateQuestion.objects
                .filter(template=parent)
                .select_related(
                    "question",
                    "template_category",
                )
                .order_by("order")
            )

            for old_tq in parent_questions:

                TemplateQuestion.objects.create(
                    template=cloned,

                    template_category=template_category_map[
                        old_tq.template_category.template_category_id
                    ],

                    question=old_tq.question,          # SAME QUESTION

                    overridden_text=old_tq.overridden_text,
                    overridden_type=old_tq.overridden_type,
                    overridden_required=old_tq.overridden_required,
                    overridden_help_text=old_tq.overridden_help_text,
                    overridden_placeholder=old_tq.overridden_placeholder,
                    overridden_options_config=old_tq.overridden_options_config,

                    is_disabled=old_tq.is_disabled,
                    order=old_tq.order,
                    created_by=request.user,
                )

        serializer = self.get_serializer(cloned)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


    def get_queryset(self):

        queryset = (
            Template.objects
            .select_related("parent_template")
            .prefetch_related(
                "template_categories",
                "template_questions",
            )
        )

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                name__icontains=search
            )

        property_type = self.request.query_params.get("property_type")

        if property_type:
            queryset = queryset.filter(
                property_type=property_type
            )

        active = self.request.query_params.get("active")

        if active is not None:

            queryset = queryset.filter(
                is_active=active.lower() == "true"
            )

        return queryset.order_by(
            "name",
            "version",
        )
    
    @action(
        detail=True,
        methods=["get"]
    )
    def preview(self, request, template_id=None):

        template = self.get_object()

        serializer = TemplatePreviewSerializer(
            template
        )

        return Response(serializer.data)
     
    @action(detail=False, methods=["get"], url_path="by-property-type")
    def by_property_type(self, request):

        property_type = request.query_params.get("property_type")

        queryset = self.get_queryset().filter(
            property_type=property_type,
            is_active=True
        )

        serializer = TemplateDropdownSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data) 