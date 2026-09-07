from rest_framework import serializers

from .models import Certificate
from enquiries.serializers import UserMiniSerializer


class CertificateSerializer(serializers.ModelSerializer):

    engineer = serializers.SerializerMethodField()

    enquiry_id = serializers.UUIDField(
        source="enquiry.enquiry_id",
        read_only=True
    )

    propertyAddress = serializers.CharField(
        source="enquiry.propertyAddress",
        read_only=True
    )

    clientName = serializers.SerializerMethodField()

    certificate_number = serializers.SerializerMethodField()

    inspection_score = serializers.DecimalField(
        source="report.total_score",
        read_only=True,
        max_digits=10,
        decimal_places=2,
    )

    inspection_date = serializers.DateTimeField(
        source="report.submitted_at",
        read_only=True,
    )

    propertyType = serializers.CharField(
        source="enquiry.propertyType",
        read_only=True,
    )

    city = serializers.CharField(
        source="enquiry.city",
        read_only=True,
    )

    agentName = serializers.CharField(
        source="report.agent.name",
        read_only=True,
    )

    templateName = serializers.CharField(
        source="report.template.name",
        read_only=True,
    )

    certificateStatus = serializers.SerializerMethodField()
    class Meta:

        model = Certificate

        fields = (
            "certificate_id",
            "enquiry_id",
            "propertyAddress",
            "clientName",
            "rating",
            "grade",
            "findings",
            "recommendations",
            "valid_until",
            "issued_at",
            "engineer",
            "certificate_number",
            "inspection_score",
            "inspection_date",
            "propertyType",
            "city",
            "agentName",
            "templateName",
            "certificateStatus",
        )

    def get_clientName(self, obj):

        return (
            obj.enquiry.created_by.name
            if obj.enquiry.created_by
            else None
        )

    def get_engineer(self, obj):
        if not obj.engineer:
            return None

        return {
            "id": obj.engineer.user_id,
            "name": obj.engineer.name or obj.engineer.username,
            "username": obj.engineer.username,
        }
    
    def get_certificate_number(self, obj):
        return f"HF-{obj.issued_at.year}-{str(obj.certificate_id).split('-')[0].upper()}"

    def get_certificateStatus(self, obj):
        return "Issued"

class IssueCertificateSerializer(serializers.Serializer):

    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1
    )

    findings = serializers.CharField()

    recommendations = serializers.CharField(
        required=False,
        allow_blank=True
    )