from django.db import models
from django.contrib.auth import get_user_model
from masters.models import Template

User = get_user_model()

import uuid


class Enquiry(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("field_engineer_assigned", "Field Engineer Assigned"),
        ("technical_auditor_assigned", "Technical Auditor Assigned"),
        ("inspection_in_progress", "Inspection In Progress"),
        ("inspection_completed", "Inspection Completed"),
        ("under_review", "Under Review"),
        ("certified", "Certified"),
        ("certificate_issued", "Certificate Issued"),
    ]

    enquiry_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enquiry_number = models.CharField(max_length=20, unique=True, blank=True, editable=False)
    propertyType = models.CharField(max_length=100)
    propertyAddress = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    constructionStage = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=50, default="pending", choices=STATUS_CHOICES)
    is_deleted = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="enquiries_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="enquiries_updated")

    certificate_issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="enquiries_certificate_issued")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    class Meta:
        ordering = ["-created_at"]
 
    def __str__(self):
        return f"{self.enquiry_id} ({self.status})"
    
    def save(self, *args, **kwargs):

        is_new = self._state.adding

        super().save(*args, **kwargs)

        if is_new and not self.enquiry_number:

            self.enquiry_number = f"ENQ{self.created_at.year}{self.pk.hex[:6].upper()}"

            super().save(update_fields=["enquiry_number"])
            
    def current_assignee(self, role):
        """Return the active EnquiryAssignment for a given role, or None."""
        return self.assignments.filter(role=role, is_active=True).first()
    
class EnquiryAssignment(models.Model):
    """
    Tracks who is currently assigned to an enquiry, per role (agent / engineer).
    Doubles as history: old rows are kept with is_active=False instead of being
    deleted or overwritten, so the full reassignment trail is queryable.
    """
 
    ROLE_CHOICES = [
        ("field_engineer", "Field Engineer"),
        ("technical_auditor", "Technical Auditor"),
    ]
 
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name="assignments")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    template = models.ForeignKey(
            Template,
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name="enquiries"
        )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="enquiry_assignments"
    )
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="assignments_made"
    )
 
    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
 
    reason = models.TextField(blank=True, null=True)
 
    class Meta:
        ordering = ["-assigned_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["enquiry", "role"],
                condition=models.Q(is_active=True),
                name="unique_active_assignment_per_role",
            )
        ]
 
    def __str__(self):
        return f"{self.enquiry.enquiry_id} - {self.role} - {self.assigned_to}"
 
 
class EnquiryStatusLog(models.Model):
    """
    Append-only log of status transitions. Enquiry.status is kept as the
    denormalized 'current value' for fast filtering; this table is the
    audit trail of how it got there.
    """
 
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name="status_logs")
    from_status = models.CharField(max_length=50, null=True, blank=True)
    to_status = models.CharField(max_length=50)
    changed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="enquiry_status_changes"
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)
 
    class Meta:
        ordering = ["-changed_at"]
 
    def __str__(self):
        return f"{self.enquiry.enquiry_id} -> {self.from_status} -> {self.to_status} @ {self.changed_at}"
