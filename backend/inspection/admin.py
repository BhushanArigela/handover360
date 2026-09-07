from django.contrib import admin

from .models import (
    InspectionReport,
    InspectionItemResponse,
    InspectionMedia,
    InspectionActivity,
    InspectionReview,
    InspectionItemReview,
)


class InspectionMediaInline(admin.TabularInline):
    model = InspectionMedia
    extra = 0
    readonly_fields = ("uploaded_at",)


@admin.register(InspectionReport)
class InspectionReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "enquiry",
        "template",
        "inspector",
        "status",
        "completion_percentage",
        "obtained_score",
        "maximum_score",
        "started_at",
        "submitted_at",
    )

    list_filter = (
        "status",
        "template",
    )

    search_fields = (
        "enquiry__enquiry_number",
        "enquiry__property_address",
        "template__name",
        "inspector__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "started_at",
        "submitted_at",
    )


@admin.register(InspectionItemResponse)
class InspectionItemResponseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "inspection_report",
        "item",
        "status",
        "severity",
        "score",
        "inspected_by",
        "inspected_at",
    )

    list_filter = (
        "status",
        "severity",
    )

    search_fields = (
        "item__name",
        "inspection_report__enquiry__enquiry_number",
        "observation",
        "rectification",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "inspected_at",
    )

    inlines = [InspectionMediaInline]


@admin.register(InspectionMedia)
class InspectionMediaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "response",
        "media_type",
        "uploaded_at",
    )

    list_filter = (
        "media_type",
    )

    search_fields = (
        "response__item__name",
        "response__inspection_report__enquiry__enquiry_number",
    )

    readonly_fields = (
        "uploaded_at",
    )


@admin.register(InspectionActivity)
class InspectionActivityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "report",
        "user",
        "action",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "report__enquiry__enquiry_number",
        "report__enquiry__property_address",
        "user__username",
        "remarks",
    )

    readonly_fields = (
        "created_at",
    )

class InspectionItemReviewInline(admin.TabularInline):
    model = InspectionItemReview
    extra = 0
    readonly_fields = (
        "reviewed_at",
    )


@admin.register(InspectionReview)
class InspectionReviewAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "inspection_report",
        "reviewer",
        "overall_rating",
        "status",
        "reviewed_items",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "inspection_report__enquiry__enquiry_number",
        "reviewer__username",
    )

    readonly_fields = (
        "created_at",
    )

    inlines = [InspectionItemReviewInline]

    # Add this method here
    def reviewed_items(self, obj):
        return obj.items.count()

    reviewed_items.short_description = "Items Reviewed"

@admin.register(InspectionItemReview)
class InspectionItemReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "review",
        "response",
        "status",
        "rating",
        "approved",
        "critical_finding",
        "rectification_required",
        "target_date",
        "reviewed_at",
    )

    list_filter = (
        "status",
        "approved",
        "critical_finding",
        "rectification_required",
    )

    search_fields = (
        "response__inspection_report__enquiry__enquiry_number",
        "response__item__name",
        "remarks",
    )

    readonly_fields = (
        "reviewed_at",
    )   