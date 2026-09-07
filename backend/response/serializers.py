from rest_framework import serializers
from .models import InspectionMedia, InspectionResponse, InspectionReport

class InspectionMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionMedia
        fields = ["media_id", "file", "file_type"]

class InspectionResponseSerializer(serializers.ModelSerializer):
    media = InspectionMediaSerializer(many=True, read_only=True)

    class Meta:
        model = InspectionResponse
        fields = [
            "response_id",
            "question_id",
            "answer_text",
            "answer_array",
            "media",
        ]

class InspectionReportSerializer(serializers.ModelSerializer):
    responses = InspectionResponseSerializer(many=True, read_only=True)

    class Meta:
        model = InspectionReport
        fields = [
            "report_id",
            "enquiry",
            "agent",
            "overall_notes",
            "status",
            "responses",
        ]