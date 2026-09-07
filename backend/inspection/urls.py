from django.urls import path

from .views import (
    DeleteInspectionMediaView,
    StartInspectionView,
    InspectionDetailView,
    SaveInspectionItemView,
    SaveDraftView,
    PreviewInspectionView,
    SubmitInspectionView,
    InspectionDashboardView, SaveReviewDraftView, ReviewPreviewView, SubmitReviewView,
    InspectionHistoryView, InspectionResponsesView, SaveDraftInspectionView, SubmitInspectionView, SaveReviewView
)

urlpatterns = [

    # Inspection Lifecycle
    path(
        "start/",
        StartInspectionView.as_view(),
        name="start-inspection",
    ),

    path(
        "<int:enquiry_id>/",
        InspectionDetailView.as_view(),
        name="inspection-detail",
    ),

    # Item Response
    path(
        "item/save/",
        SaveInspectionItemView.as_view(),
        name="save-item",
    ),

    # Draft
    path(
        "save-draft/",
        SaveDraftView.as_view(),
        name="save-draft",
    ),

    # Preview
    path(
        "preview/<int:report_id>/",
        PreviewInspectionView.as_view(),
        name="preview",
    ),

    # Submit
    path(
        "submit/",
        SubmitInspectionView.as_view(),
        name="submit",
    ),

    # Dashboard
    path(
        "dashboard/<int:report_id>/",
        InspectionDashboardView.as_view(),
        name="dashboard",
    ),

    # Activity
    path(
        "history/<int:report_id>/",
        InspectionHistoryView.as_view(),
        name="history",
    ),

    path(
        "<int:inspection_report_id>/responses/",
        InspectionResponsesView.as_view(),
        name="inspection-responses",
    ),

    path(
        "<int:inspection_report_id>/save-draft/",
        SaveDraftInspectionView.as_view(),
        name="save-draft",
    ),

    path(
        "<int:inspection_report_id>/submit/",
        SubmitInspectionView.as_view(),
        name="submit-inspection",
    ),
    path("review/save/", SaveReviewView.as_view(), name="review-save"),
    path(
        "review/<int:inspection_report_id>/save-draft/",
        SaveReviewDraftView.as_view(),
        name="review-save-draft",
    ),

    path(
        "review/preview/<int:inspection_report_id>/",
        ReviewPreviewView.as_view(),
        name="review-preview",
    ),

    path(
        "review/submit/",
        SubmitReviewView.as_view(),
        name="review-submit",
    ),

    path(
        "media/<int:media_id>/",
        DeleteInspectionMediaView.as_view(),
        name="delete_inspection_media",
    ),
]