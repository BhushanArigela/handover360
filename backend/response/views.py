from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from enquiries.models import Enquiry
from questionnaires.models import Template

from .models import (
    InspectionReport,
    InspectionResponse,
    InspectionMedia,
)
from django.contrib.auth import get_user_model
from notifications.services import create_notification
from enquiries.models import EnquiryAssignment

User = get_user_model()


class SubmitInspectionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = request.data

        enquiry = get_object_or_404(
            Enquiry,
            enquiry_id=data.get("enquiry_id")
        )

        template = get_object_or_404(
            Template,
            template_id=data.get("template_id")
        )

        started_at = timezone.now()

        report = InspectionReport.objects.create(
            enquiry=enquiry,
            template=template,
            agent=request.user,

            overall_notes=data.get("overall_notes"),

            inspection_started_at=data.get("inspection_started_at"),
            inspection_completed_at=data.get("inspection_completed_at"),

            latitude=data.get("latitude"),
            longitude=data.get("longitude"),

            device_info=data.get("device_info"),
            app_version=data.get("app_version"),

            submitted_ip=request.META.get("REMOTE_ADDR"),

            status="submitted",

            created_by=request.user,
            updated_by=request.user,
        )

        total_score = 0

        for r in data.get("responses", []):

            score = r.get("score")

            if score:
                total_score += float(score)

            InspectionResponse.objects.create(

                report=report,

                template_question_id=r["question_id"],

                answer_text=r.get("answer_text"),
                answer_array=r.get("answer_array"),
                answer_boolean=r.get("answer_boolean"),
                answer_number=r.get("answer_number"),

                remarks=r.get("remarks"),
                score=score,
                is_na=r.get("is_na", False),

                created_by=request.user,
                updated_by=request.user,
            )

        report.total_score = total_score
        report.submitted_at = timezone.now()
        report.inspection_completed_at = timezone.now()

        report.inspection_duration = int(
            (timezone.now() - started_at).total_seconds()
        )

        report.save()

        enquiry.status = "inspection_done"
        enquiry.save(update_fields=["status"])
        engineer_assignment = (
            EnquiryAssignment.objects.filter(
                enquiry=enquiry,
                role="technical_auditor",
                is_active=True,
            )
            .select_related("assigned_to")
            .first()
        )

        if engineer_assignment:

            create_notification(
                recipient=engineer_assignment.assigned_to,
                title="Inspection Submitted",
                message=(
                    f"Inspection for enquiry "
                    f"{enquiry.enquiry_number} is ready for review."
                ),
                notification_type="inspection_completed",
                reference_id=enquiry.enquiry_id,
            )

        admins = User.objects.filter(role="admin")

        for admin in admins:
            create_notification(
                recipient=admin,
                title="Inspection Completed",
                message=(
                    f"Field Engineer has completed inspection for "
                    f"{enquiry.enquiry_number}."
                ),
                notification_type="inspection_completed",
                reference_id=enquiry.enquiry_id,
            )

        if enquiry.created_by:
            create_notification(
                recipient=enquiry.created_by,
                title="Inspection Completed",
                message=(
                    f"Inspection of your property "
                    f"{enquiry.enquiry_number} has been completed "
                    "and is under review."
                ),
                notification_type="inspection_completed",
                reference_id=enquiry.enquiry_id,
            )          
        return Response({
            "message": "Inspection submitted successfully",
            "report_id": report.report_id,
            "total_score": total_score
        })
    
class UploadInspectionMedia(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        template_question_id = request.data.get("question_id")
        enquiry_id = request.data.get("enquiry_id")
        files = request.FILES.getlist("files")

        # Get latest report for this enquiry
        report = InspectionReport.objects.filter(
            enquiry_id=enquiry_id
        ).order_by("-updated_at").first()

        if not report:
            return Response({"error": "Report not found"}, status=400)

        response = InspectionResponse.objects.filter(
            report=report,
            template_question_id=template_question_id
        ).last()

        if not response:
            return Response({"error": "Response not found"}, status=400)

        for f in files:
            InspectionMedia.objects.create(
                response=response,
                file=f,
                file_type="photo" if f.content_type.startswith("image") else "video"
            )

        return Response({"message": "uploaded"})

class SaveDraftInspectionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = request.data
        print("Responses Received:")
        print(data.get("responses"))
        for r in data.get("responses", []):
            print(r)
        enquiry = get_object_or_404(
            Enquiry,
            enquiry_id=data.get("enquiry_id")
        )

        template = get_object_or_404(
            Template,
            template_id=data.get("template_id")
        )

        report, created = InspectionReport.objects.update_or_create(
            enquiry=enquiry,
            agent=request.user,
            status="draft",
            defaults={
                "template": template,
                "overall_notes": data.get("overall_notes"),
                "inspection_started_at": data.get("inspection_started_at"),
                "inspection_completed_at": data.get("inspection_completed_at"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "device_info": data.get("device_info"),
                "app_version": data.get("app_version"),
                "submitted_ip": request.META.get("REMOTE_ADDR"),
                "updated_by": request.user,
            },
        )

        if created:
            report.created_by = request.user
            report.save(update_fields=["created_by"])

        # Remove old responses
        InspectionResponse.objects.filter(report=report).delete()

        total_score = 0

        for r in data.get("responses", []):

            score = r.get("score") or 0

            total_score += float(score)

            InspectionResponse.objects.create(
                report=report,

                template_question_id=r["question_id"],

                answer_text=r.get("answer_text"),
                answer_array=r.get("answer_array"),
                answer_boolean=r.get("answer_boolean"),
                answer_number=r.get("answer_number"),

                remarks=r.get("remarks"),
                score=score,
                is_na=r.get("is_na", False),

                created_by=request.user,
                updated_by=request.user,
            )

        report.total_score = total_score
        report.save(update_fields=["total_score", "updated_at"])

        # Move enquiry to In Progress only once
        if enquiry.status == "field_engineer_assigned":
            enquiry.status = "inspection_in_progress"
            enquiry.save(update_fields=["status"])

        return Response({
            "message": "Draft saved successfully",
            "report_id": report.report_id,
            "total_score": total_score,
            "status": "draft",
        })        

class LoadDraftInspectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, enquiry_id):

        report = (
            InspectionReport.objects.filter(
                enquiry_id=enquiry_id,
                agent=request.user,
                status="draft"
            )
            .prefetch_related(
                "responses",
                "responses__template_question"
            )
            .order_by("-updated_at")
            .first()
        )

        if not report:
            return Response(
                {"draft_exists": False},
                status=status.HTTP_200_OK
            )

        response_data = []

        for r in report.responses.all():

            response_data.append({

                "template_question_id": str(r.template_question_id),

                "answer_text": r.answer_text,

                "answer_boolean": r.answer_boolean,

                "answer_number": (
                    float(r.answer_number)
                    if r.answer_number is not None
                    else None
                ),

                "answer_array": r.answer_array or [],

                "remarks": r.remarks,

                "score": (
                    float(r.score)
                    if r.score is not None
                    else 0
                ),

                "is_na": r.is_na,
            })

        return Response({

            "draft_exists": True,

            "report_id": str(report.report_id),

            "overall_notes": report.overall_notes,

            "responses": response_data,
        })