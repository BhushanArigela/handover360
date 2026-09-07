import uuid
from django.db import models
from django.contrib.auth import get_user_model
from enquiries.models import Enquiry
from questionnaires.models import TemplateQuestion, Template

User = get_user_model()

class InspectionReport(models.Model):

    template = models.ForeignKey(
        Template,
        on_delete=models.PROTECT,
        related_name="inspection_reports", null=True, blank=True
    )
        
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    report_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    enquiry = models.ForeignKey(
        Enquiry,
        on_delete=models.CASCADE,
        related_name="inspection_reports"
    )

    agent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="inspection_reports",
    )

    overall_notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="draft"
    )

    started_at = models.DateTimeField(auto_now_add=True)

    submitted_at = models.DateTimeField(
        null=True,
        blank=True
    )

    inspection_started_at = models.DateTimeField(null=True, blank=True)

    inspection_completed_at = models.DateTimeField(null=True, blank=True)

    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    device_info = models.CharField(max_length=255, blank=True)
    app_version = models.CharField(max_length=30, blank=True)

    total_score = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    submitted_ip = models.GenericIPAddressField(null=True, blank=True)

    inspection_duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Duration in seconds"
    )
    is_locked = models.BooleanField(default=False)


    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inspection_report_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inspection_report_updated")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.enquiry} - Inspection"
    
class InspectionResponse(models.Model):
    
    response_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    report = models.ForeignKey(
        InspectionReport,
        on_delete=models.CASCADE,
        related_name="responses"
    )

    template_question = models.ForeignKey(
        TemplateQuestion,
        on_delete=models.PROTECT,
        related_name="inspection_answers"
    )

    answer_text = models.TextField( blank=True,
        null=True
    )

    answer_array = models.JSONField(
        blank=True,
        null=True
    )

    answer_boolean = models.BooleanField(
        null=True,
        blank=True
    )

    answer_number = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    is_na = models.BooleanField(default=False)

    answered_at = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inspection_response_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="inspection_response_updated")
    updated_at = models.DateTimeField(auto_now=True)  

    def __str__(self):
        return str(self.template_question)
    
class InspectionMedia(models.Model):
    FILE_TYPE = (
        ("photo","Photo"),
        ("video","Video"),
    )

    media_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    response = models.ForeignKey(
        InspectionResponse,
        on_delete=models.CASCADE,
        related_name="media"
    )

    file = models.FileField(upload_to="inspection_media/%Y/%m/")

    file_type = models.CharField(
        max_length=20,
        choices=FILE_TYPE
    ) # photo/video

    caption = models.CharField(
        max_length=255,
        blank=True
    )

    display_order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True) 

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )


    def __str__(self):
        return self.file.name
