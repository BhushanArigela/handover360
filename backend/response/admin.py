# from django.contrib import admin
# from .models import (
#     InspectionReport,
#     InspectionResponse,
#     InspectionMedia
# )


# # ---------------------------
# # MEDIA INLINE (inside response)
# # ---------------------------
# class InspectionMediaInline(admin.TabularInline):
#     model = InspectionMedia
#     extra = 0
#     readonly_fields = ("media_id", "uploaded_at")
#     fields = ("file", "file_type", "uploaded_at")


# # ---------------------------
# # RESPONSE INLINE (inside report)
# # ---------------------------
# class InspectionResponseInline(admin.TabularInline):
#     model = InspectionResponse
#     extra = 0
#     inlines = [InspectionMediaInline]


# # ---------------------------
# # INSPECTION REPORT ADMIN
# # ---------------------------
# @admin.register(InspectionReport)
# class InspectionReportAdmin(admin.ModelAdmin):

#     list_display = (
#         "report_id",
#         "enquiry",
#         "agent",
#         "status",
#         "created_at"
#     )

#     list_filter = (
#         "status",
#         "created_at"
#     )

#     search_fields = (
#         "enquiry__enquiry_id",
#         "agent__username",
#         "agent__email"
#     )

#     readonly_fields = (
#         "report_id",
#         "created_at",
#         "updated_at"
#     )

#     fieldsets = (
#         ("Basic Info", {
#             "fields": ("report_id", "enquiry", "agent", "status")
#         }),
#         ("Notes", {
#             "fields": ("overall_notes",)
#         }),
#         ("Audit", {
#             "fields": ("created_by", "updated_by", "created_at", "updated_at")
#         }),
#     )

#     inlines = [
#         InspectionResponseInline
#     ]


# # ---------------------------
# # INSPECTION RESPONSE ADMIN
# # ---------------------------
# @admin.register(InspectionResponse)
# class InspectionResponseAdmin(admin.ModelAdmin):

#     list_display = (
#         "response_id",
#         "report",
#         "template_question",
#         "created_at"
#     )

#     list_filter = (
#         "created_at",
#     )

#     search_fields = (
#         "report__report_id",
#         "template_question"
#     )

#     readonly_fields = (
#         "response_id",
#         "created_at",
#         "updated_at"
#     )


# # ---------------------------
# # MEDIA ADMIN
# # ---------------------------
# @admin.register(InspectionMedia)
# class InspectionMediaAdmin(admin.ModelAdmin):

#     list_display = (
#         "media_id",
#         "response",
#         "file_type",
#         "uploaded_at"
#     )

#     list_filter = (
#         "file_type",
#         "uploaded_at"
#     )

#     search_fields = (
#         "response__response_id",
#     )

#     readonly_fields = (
#         "media_id",
#         "uploaded_at"
#     )