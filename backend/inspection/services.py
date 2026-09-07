from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import (
    InspectionReport,
    InspectionItemResponse,
    InspectionMedia,
    InspectionActivity,
)

from masters.models import Item

class InspectionService:
    @staticmethod
    @transaction.atomic
    def start_inspection(enquiry, template, inspector):

        report, created = InspectionReport.objects.get_or_create(
            enquiry=enquiry,
            defaults={
                "template": template,
                "inspector": inspector,
                "status": InspectionReport.Status.IN_PROGRESS,
                "started_at": timezone.now(),
            },
        )

        if not created and report.status == InspectionReport.Status.NOT_STARTED:
            report.status = InspectionReport.Status.IN_PROGRESS
            report.started_at = timezone.now()
            report.save()

        InspectionActivity.objects.create(
            report=report,
            user=inspector,
            action="Inspection Started",
        )

        return report

    @staticmethod
    @transaction.atomic
    def save_item(
        report,
        item,
        inspector,
        status,
        severity,
        observation,
        rectification,
        score,
        photos=None,
        videos=None,
    ):

        response, created = InspectionItemResponse.objects.update_or_create(
            inspection_report=report,
            item=item,
            defaults={
                "status": status,
                "severity": severity,
                "observation": observation,
                "rectification": rectification,
                "score": score,
                "inspected_by": inspector,
            },
        )

        if photos:

            for photo in photos:

                InspectionMedia.objects.create(
                    response=response,
                    media_type=InspectionMedia.MediaType.PHOTO,
                    file=photo,
                )
        if videos:

            for video in videos:

                InspectionMedia.objects.create(
                    response=response,
                    media_type=InspectionMedia.MediaType.VIDEO,
                    file=video,
                )   
        InspectionService.calculate_score(report)                 
        InspectionService.update_progress(report)

        InspectionActivity.objects.create(
            report=report,
            user=inspector,
            action=f"Saved Item : {item.name}",
        )

        return response

    @staticmethod
    def upload_media(response, files, media_type):

        media = []

        for file in files:

            media.append(
                InspectionMedia.objects.create(
                    response=response,
                    media_type=media_type,
                    file=file,
                )
            )

        return media

    @staticmethod
    @transaction.atomic
    def save_draft(report, notes=""):

        report.status = InspectionReport.Status.DRAFT
        report.overall_notes = notes
        report.save()

        InspectionActivity.objects.create(
            report=report,
            user=report.inspector,
            action="Draft Saved",
        )

        return report

    @staticmethod
    def preview(report):

        responses = (
            InspectionItemResponse.objects
            .filter(inspection_report=report)
            .select_related("item")
            .prefetch_related("media")
        )

        return {
            "report": report,
            "responses": responses,
            "score": InspectionService.calculate_score(report),
            "progress": InspectionService.calculate_progress(report),
        }

    @staticmethod
    @transaction.atomic
    def submit(report):

        InspectionService.update_progress(report)

        report.status = InspectionReport.Status.SUBMITTED
        report.submitted_at = timezone.now()

        report.save()

        InspectionActivity.objects.create(
            report=report,
            user=report.inspector,
            action="Inspection Submitted",
        )

        return report

    @staticmethod
    def calculate_progress(report):

        total = Item.objects.filter(
            section__room__floor__template=report.template
        ).count()

        completed = InspectionItemResponse.objects.filter(
            inspection_report=report
        ).count()

        if total == 0:
            return 0

        return round((completed / total) * 100, 2)

    @staticmethod
    def update_progress(report):

        percentage = InspectionService.calculate_progress(report)

        report.completion_percentage = percentage

        report.save(update_fields=["completion_percentage"])

    @staticmethod
    def calculate_score(report):

        total = (
            InspectionItemResponse.objects.filter(
                inspection_report=report
            )
            .aggregate(total=Sum("score"))
            .get("total")
        )

        if total is None:
            total = 0

        report.obtained_score = total
        report.save(update_fields=["obtained_score"])

        return total    

    @staticmethod
    def dashboard(report):

        total_items = Item.objects.filter(
            section__room__floor__template=report.template
        ).count()

        completed = InspectionItemResponse.objects.filter(
            inspection_report=report
        ).count()

        pending = total_items - completed

        return {
            "total_items": total_items,
            "completed_items": completed,
            "pending_items": pending,
            "percentage": report.completion_percentage,
            "score": report.obtained_score,
            "status": report.status,
        }

    @staticmethod
    def history(report):

        return InspectionActivity.objects.filter(
            report=report
        ).select_related("user")