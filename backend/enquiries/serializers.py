from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Enquiry, EnquiryAssignment, EnquiryStatusLog
from masters.models import Template
import re
from response.models import ( InspectionReport, InspectionResponse, InspectionMedia,)

User = get_user_model()  

class EnquirySerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(source="created_by.name", read_only=True)
    updated_by_name = serializers.CharField(source="updated_by.name", read_only=True)
    created_by_role = serializers.CharField(source="created_by.role", read_only=True)
    updated_by_role = serializers.CharField(source="updated_by.role", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'enquiry_id',
            "enquiry_number",
            'propertyType',
            'propertyAddress',
            'city',
            'pincode',
            'constructionStage',
            'description',
            'status',
            'created_at',
            'created_by_name',   
            'updated_by_name',
            'created_by_role',
            'updated_by_role',
        ]
        read_only_fields = ["created_by", "updated_by", "created_at", "updated_at"]

    def validate_pincode(self, value):

        if not re.match(r'^[1-9][0-9]{5}$', str(value)):
            raise serializers.ValidationError("Invalid PIN code. Must be 6 digits.")

        return value    
    
class UserMiniSerializer(serializers.ModelSerializer):
 
    class Meta:
        model = User
        fields = ["user_id", "username", "name", "email", "role"]
 
 
class EnquiryAssignmentSerializer(serializers.ModelSerializer):
    assigned_to = UserMiniSerializer(read_only=True)
    assigned_by = UserMiniSerializer(read_only=True)
    enquiry_id = serializers.UUIDField(
        source="enquiry.enquiry_id",
        read_only=True
    )
    class Meta:
        model = EnquiryAssignment
        fields = [
            "enquiry_id", "role", "assigned_to", "assigned_by",
            "assigned_at", "unassigned_at", "is_active", "reason",
        ]
 
 
class EnquiryStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source="changed_by.name",
        read_only=True
    )

    class Meta:
        model = EnquiryStatusLog
        fields = [
            "from_status",
            "to_status",
            "remarks",
            "changed_at",
            "changed_by_name"
        ]
 
 
class EnquiryListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views — only current active assignments."""
 
    current_agent = serializers.SerializerMethodField()
    current_engineer = serializers.SerializerMethodField()
 
    class Meta:
        model = Enquiry
        fields = [
            "enquiry_id", "enquiry_number", "propertyType", "propertyAddress", "city", "pincode",
            "constructionStage", "status", "created_at", "updated_at",
            "current_agent", "current_engineer",
        ]
 
    def get_current_agent(self, obj):
        active = obj.assignments.filter(role="field_engineer", is_active=True).first()
        return UserMiniSerializer(active.assigned_to).data if active and active.assigned_to else None
 
    def get_current_engineer(self, obj):
        active = obj.assignments.filter(role="technical_auditor", is_active=True).first()
        return UserMiniSerializer(active.assigned_to).data if active and active.assigned_to else None
 
 
class EnquiryDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail view — includes full assignment + status history."""
 
    created_by = UserMiniSerializer(read_only=True)
    updated_by = UserMiniSerializer(read_only=True)
    certificate_issued_by = UserMiniSerializer(read_only=True)
    assignments = EnquiryAssignmentSerializer(many=True, read_only=True)
    status_history = EnquiryStatusLogSerializer(
        source="status_logs",
        many=True,
        read_only=True
    )

    agent_name = serializers.SerializerMethodField()
    engineer_name = serializers.SerializerMethodField()

    class Meta:
        model = Enquiry
        fields = "__all__"

    def get_agent_name(self, obj):
        assignment = obj.current_assignee("field_engineer")
        return assignment.assigned_to.name if assignment else None

    def get_engineer_name(self, obj):
        assignment = obj.current_assignee("technical_auditor")
        return assignment.assigned_to.name if assignment else None
 
 
class EnquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            "propertyType", "propertyAddress", "city", "pincode",
            "constructionStage", "description",
        ]
 
 
class AssignEnquirySerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=EnquiryAssignment.ROLE_CHOICES)
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    reason = serializers.CharField(required=False, allow_blank=True)
    # template_id = serializers.UUIDField(required=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.filter(
            is_active=True,
            published=True,
        )
    )
    
class ChangeStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Enquiry.STATUS_CHOICES)
    remarks = serializers.CharField(required=False, allow_blank=True)    

class InspectionMediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionMedia
        fields = [
            "media_id",
            "file",
            "file_type",
        ]


class InspectionResponseSerializer(serializers.ModelSerializer):

    question = serializers.SerializerMethodField()

    media = InspectionMediaSerializer(
        many=True,
        read_only=True,
    )

    answer = serializers.SerializerMethodField()

    class Meta:
        model = InspectionResponse
        fields = [
            "response_id",
            "question_id",
            "question",
            "answer",
            "media",
        ]

    def get_question(self, obj):

       return None

    def get_answer(self, obj):

        if obj.answer_text:
            return obj.answer_text

        return obj.answer_array


class EngineerReviewListSerializer(serializers.ModelSerializer):

    enquiry_id = serializers.UUIDField(
        source="enquiry.enquiry_id"
    )

    propertyAddress = serializers.CharField(
        source="enquiry.propertyAddress"
    )

    city = serializers.CharField(
        source="enquiry.city"
    )

    propertyType = serializers.CharField(
        source="enquiry.propertyType"
    )

    constructionStage = serializers.CharField(
        source="enquiry.constructionStage"
    )

    status = serializers.CharField(
        source="enquiry.status"
    )

    clientName = serializers.SerializerMethodField()

    agentName = serializers.SerializerMethodField()

    submittedAt = serializers.DateTimeField(
        source="created_at"
    )

    class Meta:

        model = InspectionReport

        fields = [
            "report_id",
            "enquiry_id",
            "propertyAddress",
            "city",
            "propertyType",
            "constructionStage",
            "status",
            "clientName",
            "agentName",
            "submittedAt",
        ]

    def get_clientName(self, obj):

        return obj.enquiry.created_by.name

    def get_agentName(self, obj):

        return obj.agent.name


class EngineerReviewDetailSerializer(serializers.ModelSerializer):

    enquiry_id = serializers.UUIDField(
        source="enquiry.enquiry_id"
    )

    propertyAddress = serializers.CharField(
        source="enquiry.propertyAddress"
    )

    city = serializers.CharField(
        source="enquiry.city"
    )

    propertyType = serializers.CharField(
        source="enquiry.propertyType"
    )

    constructionStage = serializers.CharField(
        source="enquiry.constructionStage"
    )

    clientName = serializers.SerializerMethodField()

    agentName = serializers.SerializerMethodField()

    responses = InspectionResponseSerializer(
        many=True,
        read_only=True,
    )

    class Meta:

        model = InspectionReport

        fields = [
            "report_id",
            "enquiry_id",
            "propertyAddress",
            "city",
            "propertyType",
            "constructionStage",
            "overall_notes",
            "clientName",
            "agentName",
            "responses",
        ]

    def get_clientName(self, obj):

        return obj.enquiry.created_by.name

    def get_agentName(self, obj):

        return obj.agent.name    
    
class ReviewDetailSerializer(serializers.Serializer):
    enquiry = serializers.SerializerMethodField()
    agent_notes = serializers.SerializerMethodField()
    # questions = serializers.SerializerMethodField()
    responses = serializers.SerializerMethodField()

    def get_enquiry(self, obj):
        return {
            "enquiry_id": obj.enquiry.enquiry_id,
            "propertyAddress": obj.enquiry.propertyAddress,
            "propertyType": obj.enquiry.propertyType,
            "constructionStage": obj.enquiry.constructionStage,
            "status": obj.enquiry.status,
            "clientName": (
                obj.enquiry.created_by.name
                if obj.enquiry.created_by and obj.enquiry.created_by.name
                else obj.enquiry.created_by.username
            ),
        }

    def get_agent_notes(self, obj):
        return obj.report.overall_notes if obj.report else ""


    def get_responses(self, obj):
        responses = []

        for r in obj.responses.select_related(
            "template_question",
            "template_question__question",
            "template_question__template_category",
            "template_question__template_category__category",
        ).prefetch_related("media"):

            tq = r.template_question
            q = tq.question

            responses.append({
                "question_id": str(tq.template_question_id),
                "question_text": q.question_text,
                "question_type": q.type,
                "category_id": str(tq.template_category.category.category_id),
                "category_name": tq.template_category.category.name,
                "required": q.required,
                "order": tq.order,
                "answer_text": r.answer_text,
                "answer_boolean": r.answer_boolean,
                "answer_number": (
                    float(r.answer_number)
                    if r.answer_number is not None
                    else None
                ),
                "answer_array": r.answer_array,
                "score": (
                    float(r.score)
                    if r.score is not None
                    else None
                ),
                "remarks": r.remarks,
                "is_na": r.is_na,
                "media": [
                    {
                        "media_id": str(m.media_id),
                        "file": m.file.url,
                        "file_type": m.file_type,
                        "caption": m.caption,
                        "display_order": m.display_order,
                    }
                    for m in r.media.all().order_by("display_order")
                ],
            })

        return responses   