from django.urls import path

from .views import ( EngineerReviewList, EngineerReviewDetail, IssueCertificate, EngineerCompletedCertificates, CertificateList, MyCertificates, DownloadCertificatePDF
)

urlpatterns = [

    path("reviews/", EngineerReviewList.as_view(),),
    path("reviews/<uuid:enquiry_id>/", EngineerReviewDetail.as_view(),),
    path("reviews/<uuid:enquiry_id>/issue-certificate/", IssueCertificate.as_view(),),
    path("completed/",EngineerCompletedCertificates.as_view(),),
    path("certificatelist/",CertificateList.as_view(),),
    path("mycertificates/", MyCertificates.as_view(),),
    path("<uuid:certificate_id>/download/", DownloadCertificatePDF.as_view(),),
]