from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        "certificate_id",
        "enquiry",
        "engineer",
        "rating",
        "grade",
        "valid_until",
        "issued_at",
    )

    list_filter = (
        "grade",
        "issued_at",
        "valid_until",
    )

    search_fields = (
        "certificate_id",
        "enquiry__propertyAddress",
        "enquiry__city",
        "engineer__username",
        "engineer__name",
    )

    readonly_fields = (
        "certificate_id",
        "issued_at",
        "updated_at",
    )

    autocomplete_fields = (
        "enquiry",
        "report",
        "engineer",
        "created_by",
        "updated_by",
    )

    ordering = (
        "-issued_at",
    )