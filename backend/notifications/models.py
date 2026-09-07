import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("general", "General"),
        ("enquiry_created", "Enquiry Created"),
        ("field_engineer_assigned", "Field Engineer Assigned"),
        ("inspection_started", "Inspection Started"),
        ("inspection_completed", "Inspection Completed"),
        ("technical_auditor_assigned", "Technical Auditor Assigned"),
        ("inspection_approved", "Inspection Approved"),
        ("inspection_rejected", "Inspection Rejected"),
        ("certificate_generated", "Certificate Generated"),
    )

    notification_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default="general"
    )

    is_read = models.BooleanField(default=False)

    reference_id = models.UUIDField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"