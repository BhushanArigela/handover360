from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


from django.shortcuts import get_object_or_404

from enquiries.models import Enquiry
from masters.models import Template, Item
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import InspectionMedia, InspectionReport, InspectionItemResponse, InspectionReview, InspectionItemReview
from .serializers import InspectionDetailsSerializer, InspectionItemResponseSerializer
from .services import InspectionService
from notifications.services import create_notification
from enquiries.models import EnquiryAssignment

from certificates.services import issue_certificate
from certificates.serializers import CertificateSerializer

User = get_user_model()

class StartInspectionView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        enquiry = get_object_or_404(
            Enquiry,
            pk=request.data.get("enquiry_id")
        )

        template = get_object_or_404(
            Template,
            pk=request.data.get("template_id")
        )

        report = InspectionService.start_inspection(
            enquiry=enquiry,
            template=template,
            inspector=request.user
        )

        return Response({
            "success": True,
            "inspection_id": report.id
        })

class InspectionDetailView(APIView):

    def get(self, request, enquiry_id):

        report = get_object_or_404(
            InspectionReport,
            enquiry_id=enquiry_id
        )

        serializer = InspectionDetailsSerializer(report)

        return Response(serializer.data)

 
class SaveDraftInspectionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, inspection_report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=inspection_report_id,
        )

        report.status = "draft"
        report.save(update_fields=["status"])
        
        return Response({
            "success": True,
            "message": "Draft saved successfully."
        })
    
class SaveInspectionItemView(APIView):

    def post(self, request):

        report = get_object_or_404(
            InspectionReport,
            pk=request.data["inspection_report"]
        )

        item = get_object_or_404(
            Item,
            pk=request.data["item"]
        )

        response = InspectionService.save_item(

            report=report,

            item=item,

            inspector=request.user,

            status=request.data.get("status"),

            severity=request.data.get("severity"),

            observation=request.data.get("observation"),

            rectification=request.data.get("rectification"),

            score=request.data.get("score",0),

            photos=request.FILES.getlist("photos"),

            videos=request.FILES.getlist("videos"),

        )

        return Response({
            "success":True,
            "response_id":response.id,
            "message":"Inspection item saved successfully."
        })

class UploadInspectionMediaView(APIView):

    def post(self, request):

        response = get_object_or_404(
            InspectionItemResponse,
            pk=request.data.get("response_id")
        )

        photos = request.FILES.getlist("photos")

        videos = request.FILES.getlist("videos")

        if photos:

            InspectionService.upload_media(
                response,
                photos,
                "photo"
            )

        if videos:

            InspectionService.upload_media(
                response,
                videos,
                "video"
            )

        return Response({
            "success":True
        })

class SaveDraftView(APIView):

    def post(self, request):

        report = get_object_or_404(
            InspectionReport,
            pk=request.data.get("inspection_report")
        )
        enquiry = report.enquiry
        if enquiry.status == "field_engineer_assigned":
            enquiry.status = "inspection_in_progress"
            enquiry.save(update_fields=["status"])
        
        InspectionService.save_draft(

            report,

            request.data.get(
                "overall_notes",
                ""
            )

        )

        return Response({
            "success":True
        })

class PreviewInspectionView(APIView):

    def get(self, request, report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=report_id
        )

        preview = InspectionService.preview(report)

        serializer = InspectionDetailsSerializer(report)

        data = serializer.data

        data["preview"] = preview

        return Response(data)
    
class SubmitInspectionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, inspection_report_id):
        
        report = get_object_or_404(
            InspectionReport,
            pk=inspection_report_id,
        )
        enquiry = report.enquiry
        report.status = "submitted"
        report.save(update_fields=["status"])

        enquiry.status = "inspection_completed"
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
            "success": True,
            "message": "Inspection submitted successfully."
        })

           
class SaveReviewDraftView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, inspection_report_id):

        review, _ = InspectionReview.objects.get_or_create(
            inspection_report_id=inspection_report_id,
            defaults={
                "reviewer": request.user,
                "overall_rating": 0,
                "findings": "",
                "recommendations": "",
                "status": "draft",
            },
        )

        review.status = "draft"
        review.save()

        return Response({
            "success": True,
            "message": "Review draft saved.",
        })

class ReviewPreviewView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, inspection_report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=inspection_report_id,
        )

        serializer = InspectionDetailsSerializer(report)

        return Response(serializer.data)

class SubmitReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        report = get_object_or_404(
            InspectionReport,
            pk=request.data["inspection_report"],
        )

        review = get_object_or_404(
            InspectionReview,
            inspection_report=report,
        )

        review.status = "submitted"
        review.save(update_fields=["status"])

        report.status = InspectionReport.Status.APPROVED
        report.save(update_fields=["status"])

        enquiry = report.enquiry

        certificate = issue_certificate(
            enquiry=enquiry,
            report=report,
            engineer=request.user,
            review=review,
        )

        enquiry.status = "certificate_issued"
        enquiry.save(update_fields=["status"])

        return Response({
            "success": True,
            "message": "Review submitted successfully.",
            "certificate": CertificateSerializer(certificate).data,
        })            

class InspectionDashboardView(APIView):

    def get(self, request, report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=report_id
        )

        dashboard = InspectionService.dashboard(report)

        return Response(dashboard)

class InspectionHistoryView(APIView):

    def get(self, request, report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=report_id
        )

        history = InspectionService.history(report)

        data = []

        for h in history:

            data.append({

                "user":h.user.get_full_name(),

                "action":h.action,

                "remarks":h.remarks,

                "created_at":h.created_at

            })

        return Response(data)                            

class InspectionResponsesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, inspection_report_id):

        report = get_object_or_404(
            InspectionReport,
            pk=inspection_report_id,
        )

        responses = (
            InspectionItemResponse.objects
            .filter(inspection_report=report)
            .prefetch_related("media")
        )

        serializer = InspectionItemResponseSerializer(
            responses,
            many=True,
        )

        return Response(serializer.data)      

class SaveReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("REQUEST DATA:", request.data)
        print("REQUEST FILES:", request.FILES)
        inspection_report_id = request.data.get("inspection_report")

        if not inspection_report_id:
            return Response(
                {
                    "success": False,
                    "message": "inspection_report is required",
                    "received": request.data,
                },
                status=400,
            )
        report = get_object_or_404(
            InspectionReport,
            pk=inspection_report_id,
        )

        response = get_object_or_404(
            InspectionItemResponse,
            inspection_report=report,
            item_id=request.data["item_id"],
        )

        review, _ = InspectionReview.objects.get_or_create(
            inspection_report=report,
            defaults={
                "reviewer": request.user,
                "overall_rating": 0,
                "findings": "",
                "recommendations": "",
                "status": "in_review",
            },
        )

        item_review, created = InspectionItemReview.objects.update_or_create(
            review=review,
            response=response,
            defaults={
                "status": request.data.get("review_status"),
                "rating": request.data.get("review_rating", 0),
                "remarks": request.data.get("review_remarks", ""),
                "critical_finding": request.data.get(
                    "critical_finding",
                    False,
                ),
                "rectification_required": request.data.get(
                    "rectification_required",
                    False,
                ),
                "target_date": request.data.get("target_date") or None,
                "approved": request.data.get("review_status")
                == "approved",
            },
        )

        return Response(
            {
                "success": True,
                "review_id": item_review.id,
                "created": created,
            }
        )       

class DeleteInspectionMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, media_id):

        media = get_object_or_404(
            InspectionMedia,
            pk=media_id,
        )

        # Delete physical file
        if media.file:
            media.file.delete(save=False)

        media.delete()

        return Response({
            "success": True,
            "message": "Media deleted successfully."
        })    