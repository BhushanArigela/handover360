from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.
from django.db import models
from django.conf import settings

from enquiries.models import Enquiry
from masters.models import Template, Item

User = get_user_model()

class InspectionReport(models.Model):

    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    enquiry = models.OneToOneField(
        Enquiry,
        on_delete=models.CASCADE,
        related_name="newinspection_report"
    )

    template = models.ForeignKey(
        Template,
        on_delete=models.PROTECT,
        related_name="newinspection_reports"
    )

    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="newinspection_reports"
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.NOT_STARTED
    )

    overall_notes = models.TextField(
        blank=True,
        default=""
    )

    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    obtained_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    maximum_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    submitted_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.enquiry.enquiry_number}"

class InspectionItemResponse(models.Model):

    class Status(models.TextChoices):
        GOOD = "good", "Good"
        MINOR = "minor_issue", "Minor Issue"
        MAJOR = "major_issue", "Major Issue"
        NOT_APPLICABLE = "not_applicable", "Not Applicable"

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    inspection_report = models.ForeignKey(
        InspectionReport,
        on_delete=models.CASCADE,
        related_name="responses"
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="responses"
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        blank=True
    )

    observation = models.TextField(blank=True)

    rectification = models.TextField(blank=True)

    score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    inspected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )

    inspected_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "inspection_report",
            "item",
        )

    def __str__(self):
        return f"{self.inspection_report.id}-{self.item.name}"

class InspectionMedia(models.Model):

    class MediaType(models.TextChoices):
        PHOTO = "photo", "Photo"
        VIDEO = "video", "Video"

    response = models.ForeignKey(
        InspectionItemResponse,
        on_delete=models.CASCADE,
        related_name="media"
    )

    media_type = models.CharField(
        max_length=20,
        choices=MediaType.choices
    )

    file = models.FileField(
        upload_to="inspection_media/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.file.name

class InspectionActivity(models.Model):

    report = models.ForeignKey(
        InspectionReport,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )

    action = models.CharField(max_length=100)

    remarks = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]        



class InspectionReview(models.Model):

    inspection_report = models.OneToOneField(
        InspectionReport,
        on_delete=models.CASCADE,
        related_name="review",
    )

    reviewer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
    )

    overall_rating = models.DecimalField(max_digits=8,
            decimal_places=2,
            default=0)

    findings = models.TextField()

    recommendations = models.TextField()

    status = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

class InspectionItemReview(models.Model):

    review = models.ForeignKey(
        InspectionReview,
        related_name="items",
        on_delete=models.CASCADE,
    )

    response = models.ForeignKey(
        InspectionItemResponse,
        related_name="reviews",
        on_delete=models.CASCADE,
    )

    status = models.CharField(
        max_length=30,
        choices=[
            ("approved", "Approved"),
            ("rejected", "Rejected"),
            ("rework", "Need Rectification"),
        ],
    )

    rating = models.IntegerField(default=5)

    remarks = models.TextField(blank=True)

    critical_finding = models.BooleanField(default=False)

    rectification_required = models.BooleanField(default=False)

    target_date = models.DateField(null=True, blank=True)

    approved = models.BooleanField(default=True)

    reviewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("review", "response")              