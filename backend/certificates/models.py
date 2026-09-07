import uuid

from django.db import models
from django.contrib.auth import get_user_model

from enquiries.models import Enquiry
from inspection.models import InspectionReport

User = get_user_model()


class Certificate(models.Model):

    GRADE_CHOICES = (
        ("A+", "A+"),
        ("A", "A"),
        ("B+", "B+"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    )

    certificate_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    enquiry = models.OneToOneField(
        Enquiry,
        on_delete=models.CASCADE,
        related_name="certificate"
    )

    report = models.ForeignKey(
        InspectionReport,
        on_delete=models.CASCADE,
        related_name="certificates"
    )

    engineer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="issued_certificates"
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1
    )

    grade = models.CharField(
        max_length=2,
        choices=GRADE_CHOICES
    )

    findings = models.TextField()

    recommendations = models.TextField(
        blank=True,
        null=True
    )

    valid_until = models.DateField()

    issued_at = models.DateTimeField(
        auto_now_add=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="certificate_created"
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="certificate_updated"
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return str(self.certificate_id)