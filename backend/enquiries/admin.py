from django.contrib import admin

from .models import Enquiry, EnquiryAssignment, EnquiryStatusLog


class EnquiryAssignmentInline(admin.TabularInline):
    model = EnquiryAssignment
    extra = 0
    readonly_fields = ["assigned_at", "unassigned_at"]


class EnquiryStatusLogInline(admin.TabularInline):
    model = EnquiryStatusLog
    extra = 0
    readonly_fields = ["changed_at"]


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):

    list_display = (
        "enquiry_id",
        "enquiry_number",
        "propertyType",
        "city",
        "status",
        "created_by",
        "updated_by",
        "created_at",
    )

    list_filter = (
        "enquiry_number",
        "status",
        "city",
        "propertyType",
        "is_deleted",
        "created_at",
    )

    search_fields = (
        "enquiry_number",
        "enquiry_id",
        "propertyAddress",
        "city",
        "pincode",
        "created_by__username",
    )

    readonly_fields = (
        "enquiry_id",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    inlines = [EnquiryAssignmentInline, EnquiryStatusLogInline]


@admin.register(EnquiryAssignment)
class EnquiryAssignmentAdmin(admin.ModelAdmin):
    list_display = ["enquiry", "role", "assigned_to", "is_active", "assigned_at"]
    list_filter = ["role", "is_active"]


@admin.register(EnquiryStatusLog)
class EnquiryStatusLogAdmin(admin.ModelAdmin):
    list_display = ["enquiry", "from_status", "to_status", "changed_by", "changed_at"]
    list_filter = ["to_status"]