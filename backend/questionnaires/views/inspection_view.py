from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from questionnaires.models import Template
from questionnaires.serializers import InspectionTemplateSerializer


class InspectionTemplateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):

        template = get_object_or_404(
            Template,
            template_id=template_id,
            is_active=True,
        )

        serializer = InspectionTemplateSerializer(template)

        return Response(serializer.data)