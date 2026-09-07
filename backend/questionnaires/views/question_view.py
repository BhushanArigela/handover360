from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from questionnaires.models import Question
from questionnaires.serializers import QuestionSerializer


class QuestionViewSet(viewsets.ModelViewSet):

    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "question_id"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    # def get_queryset(self):

    #     queryset = Question.objects.all()

    #     search = self.request.query_params.get("search")

    #     if search:
    #         queryset = queryset.filter(question_text__icontains=search)

    #     category = self.request.query_params.get("category")

    #     if category:
    #         queryset = queryset.filter(category_id=category)

    #     active = self.request.query_params.get("active")

    #     if active is not None:
    #         queryset = queryset.filter(is_active=active.lower() == "true")

    #     return queryset.order_by("-created_at")

    @action(detail=True, methods=["patch"])
    def toggle(self, request, question_id=None):

        q = self.get_object()
        q.is_active = not q.is_active
        q.updated_by = request.user
        q.save()

        return Response(
            {"message": "Updated", "is_active": q.is_active},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["post"])
    def duplicate(self, request, question_id=None):

        question = self.get_object()

        copy = Question.objects.create(

            category=question.category,

            question_text=question.question_text + " (Copy)",

            type=question.type,

            required=question.required,

            help_text=question.help_text,

            placeholder=question.placeholder,

            has_scoring=question.has_scoring,

            minimum_score=question.minimum_score,

            maximum_score=question.maximum_score,

            options_config=question.options_config,

            is_active=False,

            created_by=request.user,
        )

        serializer = QuestionSerializer(copy)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["get"])
    def dropdown(self, request):

        questions = (
            Question.objects
            .filter(is_active=True)
            .select_related("category")
            .order_by("question_text")
            .values(
                "question_id",
                "question_text",
                "category",
                "category__name",
                "type",
            )
        )

        data = []

        for q in questions:
            data.append({
                "question_id": q["question_id"],
                "question_text": q["question_text"],
                "category": q["category"],
                "category_name": q["category__name"],
                "type": q["type"],
            })

        return Response(data) 
    
    def get_queryset(self):

        queryset = Question.objects.select_related("category")

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                question_text__icontains=search
            )

        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(
                category_id=category
            )

        active = self.request.query_params.get("active")

        if active is not None:
            queryset = queryset.filter(
                is_active=active.lower() == "true"
            )

        return queryset.order_by(
            "category__name",
            
        )