from django.db import transaction
from django.utils import timezone

from .models import Enquiry, EnquiryAssignment, EnquiryStatusLog


@transaction.atomic
def assign_enquiry(enquiry: Enquiry, *, template:str, role: str, assigned_to, assigned_by, reason=None):
    """
    Assign (or reassign) an enquiry to a user for a given role.
    Deactivates any existing active assignment for that role first,
    so history is preserved instead of overwritten.
    """
    existing = enquiry.assignments.filter(role=role, is_active=True).first()
    if existing:
        existing.is_active = False
        existing.unassigned_at = timezone.now()
        existing.save(update_fields=["is_active", "unassigned_at"])

    new_assignment = EnquiryAssignment.objects.create(
        enquiry=enquiry,
        template=template,
        role=role,
        assigned_to=assigned_to,
        assigned_by=assigned_by,
        reason=reason,
    )

    enquiry.updated_by = assigned_by
    enquiry.save(update_fields=["updated_by", "updated_at"])

    return new_assignment


@transaction.atomic
def unassign_enquiry(enquiry: Enquiry, *, role: str, unassigned_by, reason=None):
    existing = enquiry.assignments.filter(role=role, is_active=True).first()
    if not existing:
        return None

    existing.is_active = False
    existing.unassigned_at = timezone.now()
    if reason:
        existing.reason = reason
    existing.save(update_fields=["is_active", "unassigned_at", "reason"])

    enquiry.updated_by = unassigned_by
    enquiry.save(update_fields=["updated_by", "updated_at"])

    return existing


@transaction.atomic
def change_status(enquiry: Enquiry, *, new_status: str, changed_by, remarks=None):
    """
    Updates Enquiry.status (denormalized current value) and writes a row
    to EnquiryStatusLog (audit trail).
    """
    old_status = enquiry.status

    enquiry.status = new_status
    enquiry.updated_by = changed_by

    update_fields = ["status", "updated_by"]

    if new_status == "certificate_issued":
        enquiry.certificate_issued_by = changed_by
        enquiry.certificate_issued_at = timezone.now()
        update_fields += ["certificate_issued_by", "certificate_issued_at"]

    enquiry.save(update_fields=update_fields)

    EnquiryStatusLog.objects.create(
        enquiry=enquiry,
        from_status=old_status,
        to_status=new_status,
        changed_by=changed_by,
        remarks=remarks,
    )

    return enquiry