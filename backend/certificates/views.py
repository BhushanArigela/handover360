from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from .services import generate_certificate_pdf
from response.models import InspectionReport
from .models import Certificate
from enquiries.models import Enquiry
from notifications.services import create_notification
from django.contrib.auth import get_user_model

User = get_user_model()

from enquiries.serializers import (
    EngineerReviewListSerializer,
    EngineerReviewDetailSerializer,
)

from .serializers import (
    IssueCertificateSerializer,
    CertificateSerializer,
)

from .services import issue_certificate


class EngineerReviewList(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        reports = InspectionReport.objects.filter(
            status="submitted",
            enquiry__status__in=[
                "inspection_done",
                "under_review",
            ],
            enquiry__assignments__assigned_to=request.user,
            enquiry__assignments__role="technical_auditor",
            enquiry__assignments__is_active=True,
        ).select_related(
            "enquiry",
            "agent",
        )

        serializer = EngineerReviewListSerializer(
            reports,
            many=True,
        )

        return Response(serializer.data)


class EngineerReviewDetail(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, enquiry_id):

        report = (
            InspectionReport.objects
            .prefetch_related("responses__media")
            .filter(
                enquiry__enquiry_id=enquiry_id,
                status="submitted",
            )
            .order_by("-submitted_at", "-updated_at")
            .first()
        )

        if not report:
            return Response(
                {"detail": "Inspection report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EngineerReviewDetailSerializer(
            report
        )

        return Response(serializer.data)


class IssueCertificate(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, enquiry_id):

        serializer = IssueCertificateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        enquiry = get_object_or_404(
            Enquiry,
            enquiry_id=enquiry_id,
        )

        report = (
            InspectionReport.objects.filter(
                enquiry=enquiry,
                status="submitted",
            )
            .order_by("-submitted_at", "-updated_at")
            .first()
        )

        if not report:
            return Response(
                {"detail": "No submitted inspection report found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            certificate = issue_certificate(
                enquiry=enquiry,
                report=report,
                engineer=request.user,
                rating=serializer.validated_data["rating"],
                findings=serializer.validated_data["findings"],
                recommendations=serializer.validated_data.get(
                    "recommendations",
                    ""
                ),
            )
            if enquiry.created_by:
                create_notification(
                    recipient=enquiry.created_by,
                    title="Inspection Certificate Issued",
                    message=(
                        f"Certificate for enquiry "
                        f"{enquiry.enquiry_number} has been generated."
                    ),
                    notification_type="certificate_generated",
                    reference_id=enquiry.enquiry_id,
                )

            admins = User.objects.filter(role="admin")
            for admin in admins:

                create_notification(
                    recipient=admin,
                    title="Certificate Generated",
                    message=(
                        f"Certificate for enquiry "
                        f"{enquiry.enquiry_number} has been issued."
                    ),
                    notification_type="certificate_generated",
                    reference_id=enquiry.enquiry_id,
                )    
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            CertificateSerializer(certificate).data,
            status=status.HTTP_201_CREATED,
        )
    
class EngineerCompletedCertificates(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        certificates = (
            Certificate.objects.filter(engineer=request.user)
            .select_related("engineer", "enquiry")
            .order_by("-issued_at")
        )

        serializer = CertificateSerializer(
            certificates,
            many=True
        )

        return Response(serializer.data)

class CertificateList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "admin":
            return Response(
                {"detail": "Permission denied"},
                status=403,
            )

        certificates = (
            Certificate.objects.select_related(
                "enquiry",
                "engineer",
            )
            .order_by("-issued_at")
        )

        serializer = CertificateSerializer(
            certificates,
            many=True,
        )

        return Response(serializer.data)        

class MyCertificates(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        certificates = (
            Certificate.objects.filter(
                enquiry__created_by=request.user
            )
            .select_related(
                "engineer",
                "enquiry",
                "report",
            )
            .order_by("-issued_at")
        )

        serializer = CertificateSerializer(
            certificates,
            many=True,
        )

        return Response(serializer.data)    

class DownloadCertificatePDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, certificate_id):

        certificate = get_object_or_404(
            Certificate.objects.select_related(
                "engineer",
                "enquiry",
                "report",
            ),
            certificate_id=certificate_id,
        )

        pdf = generate_certificate_pdf(certificate)

        response = FileResponse(
          pdf,
          content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'inline; filename="Certificate-{certificate.certificate_id}.pdf"'
        )

        return response   