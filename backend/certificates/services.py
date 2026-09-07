from datetime import timedelta

from django.utils import timezone

from .models import Certificate

from enquiries import services as enquiry_services
from io import BytesIO
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO
from django.db.models import Avg
from django.conf import settings
from django.template.loader import get_template
from xhtml2pdf import pisa
from inspection.models import InspectionItemReview

def calculate_grade(rating):

    rating = float(rating)

    if rating >= 4.5:
        return "A+"

    if rating >= 4:
        return "A"

    if rating >= 3.5:
        return "B+"

    if rating >= 3:
        return "B"

    if rating >= 2:
        return "C"

    return "D"



def issue_certificate(
    enquiry,
    report,
    review,
    engineer,
):

    if Certificate.objects.filter(enquiry=enquiry).exists():
        raise ValueError("Certificate already issued.")

    item_reviews = (
        InspectionItemReview.objects
        .filter(review=review)
        .select_related(
            "response",
            "response__item",
            "response__item__section",
            "response__item__section__room",
            "response__item__section__room__floor",
        )
    )

    # ----------------------------------------------------
    # Overall Rating
    # ----------------------------------------------------

    overall_rating = round(
        item_reviews.aggregate(
            avg=Avg("rating")
        )["avg"] or 0,
        1,
    )

    # ----------------------------------------------------
    # Critical Findings
    # ----------------------------------------------------

    findings_list = []

    for item_review in item_reviews:

        response = item_review.response

        has_finding = any([
            response.observation.strip(),
            item_review.remarks.strip(),
            item_review.critical_finding,
            item_review.rectification_required,
            item_review.status in ["rejected", "rework"],
        ])

        if not has_finding:
            continue

        finding = [
            f"<b>Location </b>: {response.item.section.room.floor.name} → "
            f"{response.item.section.room.name} → "
            f"{response.item.section.name}",

            f"<b>Item</b> : {response.item.name}",
        ]

        if response.observation:
            finding.append(
                f"<b>Observation</b> : {response.observation}"
            )

        if item_review.remarks:
            finding.append(
                f"<b>Auditor Remarks</b> : {item_review.remarks}"
            )

        if item_review.critical_finding:
            finding.append("<b>Critical Finding</b> : Yes")

        findings_list.append("\n".join(finding))

    findings = "\n\n".join(findings_list)

    # ----------------------------------------------------
    # Recommendations
    # ----------------------------------------------------

    recommendations_list = []

    for item_review in item_reviews:

        response = item_review.response

        has_recommendation = any([
            response.rectification.strip(),
            item_review.remarks.strip(),
            item_review.rectification_required,
            item_review.status == "rework",
            item_review.target_date,
        ])

        if not has_recommendation:
            continue

        recommendation = [
            f"<b>Location </b>: {response.item.section.room.floor.name} → "
            f"{response.item.section.room.name} → "
            f"{response.item.section.name}",

            f"<b>Item</b> : {response.item.name}",
        ]

        if response.rectification:
            recommendation.append(
                f"<b>Rectification</b> : {response.rectification}"
            )

        if item_review.remarks:
            recommendation.append(
                f"<b>Auditor Recommendation</b> : {item_review.remarks}"
            )

        if item_review.target_date:
            recommendation.append(
                f"<b>Target Date</b> : {item_review.target_date}"
            )

        recommendations_list.append(
            "\n".join(recommendation)
        )

    recommendations = "\n\n".join(recommendations_list)

    # ----------------------------------------------------
    # Create Certificate
    # ----------------------------------------------------

    certificate = Certificate.objects.create(
        enquiry=enquiry,
        report=report,
        engineer=engineer,

        rating=overall_rating,
        grade=calculate_grade(overall_rating),

        findings=findings,
        recommendations=recommendations,

        valid_until=timezone.now().date() + timedelta(days=365),

        created_by=engineer,
        updated_by=engineer,
    )

    # ----------------------------------------------------
    # Update Enquiry
    # ----------------------------------------------------

    enquiry_services.change_status(
        enquiry,
        new_status="certificate_issued",
        changed_by=engineer,
        remarks="Certificate issued",
    )

    enquiry.certificate_issued_by = engineer
    enquiry.save(
        update_fields=[
            "certificate_issued_by",
        ]
    )

    # ----------------------------------------------------
    # Update Inspection Report
    # ----------------------------------------------------

    report.status = "approved"
    report.save(update_fields=["status"])

    return certificate


def generate_certificate_pdf(certificate):

    template = get_template("certificates/certificate.html")

    context = {
        "certificate": certificate,
    }

    html = template.render(context)

    result = BytesIO()

    pisa_status = pisa.CreatePDF(
        html,
        dest=result,
        encoding="UTF-8",
    )

    if pisa_status.err:
        raise Exception("Unable to generate PDF")

    result.seek(0)

    return result