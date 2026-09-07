from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from questionnaires.models import Category
from questionnaires.serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "category_id"

    # CREATE
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # UPDATE
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    # LIST + SEARCH
    def get_queryset(self):

        queryset = Category.objects.all()

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(name__icontains=search)

        active = self.request.query_params.get("active")

        if active is not None:
            queryset = queryset.filter(is_active=active.lower() == "true")

        return queryset.order_by("name")

    # TOGGLE ACTIVE
    def toggle(self, request, category_id=None):

        category = self.get_object()

        category.is_active = not category.is_active
        category.updated_by = request.user
        category.save()

        return Response(
            {
                "message": "Status updated",
                "is_active": category.is_active
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["get"])
    def dropdown(self, request):
        data = self.get_queryset().values("category_id", "name")
        return Response(data) 