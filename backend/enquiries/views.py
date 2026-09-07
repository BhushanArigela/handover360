from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from notifications.services import create_notification
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from inspection.models import InspectionReport
from masters.serializers import TemplateStructureSerializer
from django.shortcuts import get_object_or_404
from inspection.serializers import InspectionItemResponseSerializer


from . import services
from .models import Enquiry, EnquiryAssignment, EnquiryStatusLog
from .serializers import (
    EnquirySerializer,
    AssignEnquirySerializer,
    ChangeStatusSerializer,
    EnquiryCreateSerializer,
    EnquiryDetailSerializer,
    EnquiryListSerializer,
    ReviewDetailSerializer,
)

User = get_user_model()

class EnquiryCreateView(APIView): #create from builder/ buyer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.GET.get("search", "")
        status = request.GET.get("status", "")

        enquiries = Enquiry.objects.filter(
            created_by=request.user
        )

        if search:
            enquiries = enquiries.filter(
                Q(propertyAddress__icontains=search)
                | Q(city__icontains=search)
            )

        if status and status != "all":
            enquiries = enquiries.filter(
                status=status
            )

        serializer = EnquirySerializer(
            enquiries.order_by("-created_at"),
            many=True
        )

        return Response(serializer.data)
    
    def post(self, request):
        # print(request.user)
        # print(request.user.is_authenticated)
        serializer = EnquirySerializer(data=request.data)

        if serializer.is_valid():
            enquiry = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )

            admins = User.objects.filter(role="admin")
            for admin in admins:
                create_notification(
                    recipient=admin,
                    title="New Enquiry Received",
                    message=f"Enquiry {enquiry.enquiry_number} has been submitted by {request.user.name}.",
                    notification_type="enquiry_created",
                    reference_id=enquiry.enquiry_id,
                )

            EnquiryStatusLog.objects.create(
            enquiry=enquiry,
            from_status=None,
            to_status="pending",
            changed_by=request.user,
            remarks="Enquiry created"
        )
            return Response(EnquirySerializer(enquiry).data, status=201)

        return Response(serializer.errors, status=400)

class MyEnquiriesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.GET.get("search", "")
        status_filter = request.GET.get("status", "")

        enquiries = Enquiry.objects.filter(
            created_by=request.user,
            is_deleted=False
        )

        if search:
            enquiries = enquiries.filter(
                propertyAddress__icontains=search
            ) | enquiries.filter(
                city__icontains=search
            )

        if status_filter and status_filter != "all":
            enquiries = enquiries.filter(
                status=status_filter
            )

        serializer = EnquirySerializer(enquiries.order_by("-created_at"), many=True)

        return Response(serializer.data)
        
# GET + POST
class EnquiryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role=="admin":
            enquiries = Enquiry.objects.filter(is_deleted=False).order_by("-created_at")
        else:
            enquiries = Enquiry.objects.filter(created_by=request.user).order_by("-created_at")
        data = [] 
        for enquiry in enquiries: 
            latest_assignment = ( EnquiryStatusLog.objects .filter( enquiry=enquiry, changed_by__role__in=["field_engineer", "tecnical_auditor"] ) .select_related("changed_by") .order_by("-changed_at") .first() )
            serializer_data = EnquirySerializer(enquiry).data
            serializer_data["assigned_user"] = ( latest_assignment.changed_by.get_full_name() 
                                                or latest_assignment.changed_by.username ) if latest_assignment else None

            serializer_data["assigned_role"] = ( latest_assignment.changed_by.role ) if latest_assignment else None
            data.append(serializer_data)
        return Response(data)
        
    def post(self, request):
        serializer = EnquirySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


# DETAIL / UPDATE (optional)
class EnquiryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        enquiry = Enquiry.objects.get(
            enquiry_id=pk
        )

        serializer = EnquiryDetailSerializer(
            enquiry
        )

        return Response(serializer.data)

    def patch(self, request, pk):
        enquiry = Enquiry.objects.get(enquiry_id=pk)
        serializer = EnquirySerializer(enquiry, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.filter(is_deleted=False).prefetch_related(
        "assignments", "assignments__assigned_to", "status_logs", "status_logs__changed_by"
    )
    permission_classes = [permissions.IsAuthenticated]
 
    def get_serializer_class(self):
        if self.action == "list":
            return EnquiryListSerializer
        if self.action == "create":
            return EnquiryCreateSerializer
        return EnquiryDetailSerializer
 
    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        role_param = self.request.query_params.get("assigned_role")
        user_param = self.request.query_params.get("assigned_to")
 
        if status_param:
            qs = qs.filter(status=status_param)
 
        if role_param and user_param:
            qs = qs.filter(
                assignments__role=role_param,
                assignments__assigned_to_id=user_param,
                assignments__is_active=True,
            )
 
        return qs.distinct()
 
    def perform_create(self, serializer):
        enquiry = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        admins = User.objects.filter(role="admin")

        for admin in admins:
            create_notification(
                recipient=admin,
                title="New Enquiry Received",
                message=f"Enquiry {enquiry.enquiry_number} has been submitted by {self.request.user.name}.",
                notification_type="enquiry_created",
                reference_id=enquiry.enquiry_id,
            )
 
    def perform_destroy(self, instance):
        # Soft delete instead of actually removing the row
        instance.is_deleted = True
        instance.updated_by = self.request.user
        instance.save(update_fields=["is_deleted", "updated_by", "updated_at"])
 
    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        """
        POST /api/enquiries/{enquiry_id}/assign/
        body: { "role": "field_engineer" | "technical_auditor", "assigned_to": <user_id>, "reason": "..." }
        Works for both first-time assignment and reassignment — same endpoint.
        """
        enquiry = self.get_object()

        serializer = AssignEnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
    
        role=serializer.validated_data["role"]
        template = serializer.validated_data.get("template_id")

        if role == "field_engineer":

            if not template:
                return Response(
                    {
                        "template_id": "Template is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            enquiry.template = template
            enquiry.save(
                update_fields=[
                    "template"
                ]
            )
            
        assignment = services.assign_enquiry(
            enquiry,
            template = enquiry.template,
            role=role,
            assigned_to=serializer.validated_data["assigned_to"],
            assigned_by=request.user,
            reason=serializer.validated_data.get("reason"),
        )

        create_notification(
            recipient=assignment.assigned_to,
            title="New Inspection Assigned",
            message=(
                f"You have been assigned enquiry "
                f"{enquiry.enquiry_number} for inspection."
            ),
            notification_type="field_engineer_assigned",
            reference_id=enquiry.enquiry_id,
        )
        # Update status automatically
        if role == "field_engineer":
            services.change_status(
                enquiry,
                new_status="field_engineer_assigned",
                changed_by=request.user,
                remarks=f"Field Engineer assigned to {assignment.assigned_to.name or assignment.assigned_to.username}"
            )
            if enquiry.created_by:
                create_notification(
                    recipient=enquiry.created_by,
                    title="Inspection Scheduled",
                    message=(
                        f"Your enquiry {enquiry.enquiry_number} "
                        "has been assigned to an inspection field engineer."
                    ),
                    notification_type="field_engineer_assigned",
                    reference_id=enquiry.enquiry_id,
                )
        elif role == "technical_auditor":
            services.change_status(
                enquiry,
                new_status="under_review",
                changed_by=request.user,
                remarks=f"Technical Auditor assigned to {assignment.assigned_to.name or assignment.assigned_to.username}"
            )
            create_notification(
                recipient=assignment.assigned_to,
                title="Inspection Ready For Review",
                message=(
                    f"Enquiry {enquiry.enquiry_number} "
                    f"is ready for engineering review."
                ),
                notification_type="technical_auditor_assigned",
                reference_id=enquiry.enquiry_id,
            )    
        enquiry.refresh_from_db()
        return Response(
            EnquiryDetailSerializer(enquiry).data,
            status=status.HTTP_200_OK,
        )
 
    @action(detail=True, methods=["post"], url_path="unassign")
    def unassign(self, request, pk=None):
        enquiry = self.get_object()
        role = request.data.get("role")
        if role not in dict(EnquiryAssignment.ROLE_CHOICES):
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
 
        services.unassign_enquiry(
            enquiry, role=role, unassigned_by=request.user, reason=request.data.get("reason")
        )
        return Response(EnquiryDetailSerializer(enquiry).data, status=status.HTTP_200_OK)
 
    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status_action(self, request, pk=None):
        """
        POST /api/enquiries/{enquiry_id}/change-status/
        body: { "status": "under_review", "remarks": "..." }
        """
        enquiry = self.get_object()
        serializer = ChangeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        services.change_status(
            enquiry,
            new_status=serializer.validated_data["status"],
            changed_by=request.user,
            remarks=serializer.validated_data.get("remarks"),
        )
 
        return Response(EnquiryDetailSerializer(enquiry).data, status=status.HTTP_200_OK) 
 
class AssignableUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Helper endpoint so the frontend can populate assignee dropdowns,
    filtered by role: /api/assignable-users/?role=field_engineer
    """
    permission_classes = [permissions.IsAuthenticated]
 
    def get_queryset(self):
        qs = User.objects.filter(is_active=True)
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        if self.request.user.role == "admin":
            qs = qs.filter(created_by=self.request.user)    
        return qs
 
    def get_serializer_class(self):
        from .serializers import UserMiniSerializer
        return UserMiniSerializer      

class PendingEnquiriesView(APIView):
    def get(self, request):
        enquiries = Enquiry.objects.filter(
            status__in=["pending","created", "inspection_in_progress", 'field_engineer_assigned', 'inspection_scheduled', 'under_review']
        ).order_by("-created_at")

        serializer = EnquirySerializer(enquiries, many=True)
        return Response(serializer.data)  

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):

        total_users = User.objects.count()

        builders = User.objects.filter(role="builder").count()
        buyers = User.objects.filter(role="buyer").count()
        agents = User.objects.filter(role="field_engineer",created_by=request.user).count()
        engineers = User.objects.filter(role="technical_auditor",created_by=request.user).count()

        total = Enquiry.objects.count()

        pending = Enquiry.objects.filter(status='pending').count()

        active = Enquiry.objects.filter(
            status__in=['field_engineer_assigned', 'inspection_scheduled', 'inspection_in_progress']
        ).count()

        completed = Enquiry.objects.filter(
            status='certificate_issued'
        ).count()

        recent = Enquiry.objects.order_by('-updated_at')[:8]

        return Response({
            "users": {
                "total": total_users,
                "builders": builders,
                "buyers": buyers,
                "agents": agents,
                "engineers": engineers,
            },
            "stats": {
                "total": total,
                "pending": pending,
                "active": active,
                "completed": completed,
            },
            "recent_enquiries": [
                {
                    "id": e.enquiry_id,
                    "propertyAddress": e.propertyAddress,
                    "propertyType": e.propertyType,
                    "status": e.status,
                    "updatedAt": e.updated_at
                }
                for e in recent
            ]
        })
    
# ***********Field Engineer Dashboard *****
class AgentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        active_assignments = EnquiryAssignment.objects.filter(
            assigned_to=request.user,
            role="field_engineer",
            is_active=True
        ) .select_related(
            "enquiry",
            "enquiry__created_by"
        )

        enquiry_ids = active_assignments.values_list(
            "enquiry_id",
            flat=True
        )

        enquiries = Enquiry.objects.filter(
            enquiry_id__in=enquiry_ids,
            is_deleted=False
        )

        pending_statuses = [
            "field_engineer_assigned",
            "inspection_scheduled",
            "inspection_in_progress"
        ]

        completed_statuses = [
            "inspection_completed",
            "under_review",
            "review_completed",
            "certificate_issued"
        ]

        pending_enquiries = enquiries.filter(
            status__in=pending_statuses
        )

        completed_enquiries = enquiries.filter(
            status__in=completed_statuses
        )

        return Response({
            "stats": {
                "total_assigned": enquiries.count(),
                "pending_inspections": pending_enquiries.count(),
                "completed_inspections": completed_enquiries.count(),
                "reports_submitted": completed_enquiries.count()
            },
            "pending_inspections": [
                {
                    "enquiry_id": e.enquiry_id,
                    "propertyAddress": e.propertyAddress,
                    "propertyType": e.propertyType,
                    "city": e.city,
                    "status": e.status,
                    "clientName": (
                        e.created_by.name
                        if e.created_by and e.created_by.name
                        else (
                            e.created_by.username
                            if e.created_by
                            else "Unknown Client"
                        )
                    )
                }
                for e in pending_enquiries.order_by("-created_at")[:10]
            ]
        })        

class AgentAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assignments = (
            EnquiryAssignment.objects
            .filter(
                assigned_to=request.user,
                role="field_engineer",
                is_active=True
            )
            .select_related(
                "enquiry",
                "enquiry__created_by",
                "template"
            )
        )

        data = []

        for assignment in assignments:

            enquiry = assignment.enquiry

            if enquiry.status not in [
                "field_engineer_assigned",
                "inspection_scheduled",
                "inspection_in_progress"
            ]:
                continue

            data.append({
                "enquiry_id": enquiry.enquiry_id,
                "propertyAddress": enquiry.propertyAddress,
                "city": enquiry.city,
                "propertyType": enquiry.propertyType,
                "constructionStage": enquiry.constructionStage,
                "status": enquiry.status,

                "clientName": (
                    enquiry.created_by.name
                    if enquiry.created_by and enquiry.created_by.name
                    else (
                        enquiry.created_by.username
                        if enquiry.created_by
                        else "Unknown Client"
                    )
                ),

                "template_id": (
                    str(assignment.template.id)
                    if assignment.template
                    else None
                ),

                "template_name": (
                    assignment.template.name
                    if assignment.template
                    else None
                )
            })

        return Response(data)    

class AgentCompletedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assignments = (
            EnquiryAssignment.objects
            .filter(
                assigned_to=request.user,
                role="field_engineer",
                is_active=True
            )
            .select_related(
                "enquiry",
                "enquiry__created_by"
            )
        )

        completed_statuses = [
            "inspection_completed",
            "under_review",
            "review_completed",
            "certificate_issued"
        ]

        data = []

        for assignment in assignments:

            enquiry = assignment.enquiry

            if enquiry.status not in completed_statuses:
                continue

            data.append({
                "enquiry_id": enquiry.enquiry_id,
                "propertyAddress": enquiry.propertyAddress,
                "city": enquiry.city,
                "propertyType": enquiry.propertyType,
                "status": enquiry.status,
                "clientName": enquiry.created_by.name
                    if enquiry.created_by.name
                    else enquiry.created_by.username,
            })

        return Response(data)


# ***********Enginerr Dashboard *****
class EngineerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assignments = EnquiryAssignment.objects.filter(
            assigned_to=request.user,
            role="technical_auditor",
            is_active=True
        ).select_related("enquiry")

        enquiry_ids = assignments.values_list(
            "enquiry_id",
            flat=True
        )

        enquiries = Enquiry.objects.filter(
            enquiry_id__in=enquiry_ids,
            is_deleted=False
        )

        pending_reviews = enquiries.filter(
            status__in=[
                "inspection_completed",
                "under_review"
            ]
        )

        completed_reviews = enquiries.filter(
            status="certificate_issued"
        )

        return Response({
            "stats": {
                "pending_reviews": pending_reviews.count(),
                "reviews_done": completed_reviews.count(),
                "certificates_issued": completed_reviews.count(),
                "total_assigned": enquiries.count()
            },
            "pending_reviews": [
                {
                    "enquiry_id": e.enquiry_id,
                    "propertyAddress": e.propertyAddress,
                    "city": e.city,
                    "propertyType": e.propertyType,
                    "status": e.status,
                }
                for e in pending_reviews.order_by("-updated_at")[:5]
            ]
        })
    
class EngineerAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assignments = EnquiryAssignment.objects.filter(
            assigned_to=request.user,
            role="technical_auditor",
            is_active=True
        ).select_related("enquiry", "enquiry__created_by")

        data = []

        for assignment in assignments:
            enquiry = assignment.enquiry

            if enquiry.status not in ["inspection_completed", "under_review"]:
                continue

            data.append({
                "enquiry_id": enquiry.enquiry_id,
                "propertyAddress": enquiry.propertyAddress,
                "city": enquiry.city,
                "propertyType": enquiry.propertyType,
                "constructionStage": enquiry.constructionStage,

                "status": enquiry.status,

                # ✅ FIXED client name (same as field_engineer API)
                "clientName": (
                    enquiry.created_by.name
                    if enquiry.created_by and enquiry.created_by.name
                    else enquiry.created_by.username
                ),

                # optional but useful
                "engineerName": (
                    assignment.assigned_to.name
                    if hasattr(assignment.assigned_to, "name")
                    else assignment.assigned_to.username
                ),

                "updated_at": enquiry.updated_at,
            })

        return Response({
            "pending_reviews": data
        })

class ReviewPayload:
    def __init__(self, enquiry, report, responses, questions):
        self.enquiry = enquiry
        self.report = report
        self.responses = responses
        self.questions = questions
            
class EngineerReviewDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, enquiry_id):

        enquiry = get_object_or_404(
            Enquiry.objects.select_related(
                "created_by",
            ),
            enquiry_id=enquiry_id,
        )

        report = get_object_or_404(
            InspectionReport.objects.select_related(
                "template",
                "inspector",
            ),
            enquiry=enquiry,
        )

        template = report.template

        template_data = TemplateStructureSerializer(template).data

        responses = (
            report.responses
            .select_related("item")
            .prefetch_related("media")
        )

        response_map = {}

        for response in responses:
            response_map[response.item_id] = InspectionItemResponseSerializer(response).data

        return Response(
            {
                "enquiry": {
                    "enquiry_id": enquiry.enquiry_id,
                    "enquiry_number": enquiry.enquiry_number,
                    "propertyAddress": enquiry.propertyAddress,
                    "propertyType": enquiry.propertyType,
                    "constructionStage": enquiry.constructionStage,
                    "clientName": enquiry.created_by.name,
                    "status": enquiry.status,
                },

                "inspection_report": {
                    "id": report.id,
                    "status": report.status,
                    "overall_notes": report.overall_notes,
                    "completion_percentage": float(report.completion_percentage),
                    "obtained_score": float(report.obtained_score),
                    "maximum_score": float(report.maximum_score),
                },

                "template": template_data,

                "responses": response_map,
            }
        )