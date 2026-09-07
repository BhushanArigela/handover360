from django.urls import path
from .views import SubmitInspectionView, UploadInspectionMedia, SaveDraftInspectionView, LoadDraftInspectionView

urlpatterns = [
    path("inspection/save-draft/", SaveDraftInspectionView.as_view(), name="inspection-save-draft",),
    path("inspection/submit/", SubmitInspectionView.as_view()),
    path("upload-media/", UploadInspectionMedia.as_view()),
    path("inspection/draft/<uuid:enquiry_id>/", LoadDraftInspectionView.as_view(), name="inspection-draft"),
]