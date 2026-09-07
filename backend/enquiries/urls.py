from django.urls import include, path
# from rest_framework.routers import DefaultRouter
from .views import (EnquiryListCreateView, EnquiryDetailView, EnquiryCreateView, MyEnquiriesView, AssignableUserViewSet, EnquiryViewSet, PendingEnquiriesView, DashboardStatsView, 
AgentDashboardView, AgentAssignmentsView, AgentCompletedView, 
EngineerDashboardView, EngineerAssignmentView, EngineerReviewDetailView # Engineer Dashboard
)


urlpatterns = [
    path("create/", EnquiryCreateView.as_view()),
    path("my-enquiries/", MyEnquiriesView.as_view()),
    path("all_enquiries/", EnquiryListCreateView.as_view()),
    path("<uuid:pk>/", EnquiryDetailView.as_view()),
    path("assignable-users/", AssignableUserViewSet.as_view({"get": "list"}), name="assignable-users"),
    path("<uuid:pk>/assign/", EnquiryViewSet.as_view({"post": "assign"}), name="enquiry-assign"),
    path("<uuid:pk>/change-status/", EnquiryViewSet.as_view({"post": "change_status_action"}), name="enquiry-change-status"),
    path("<uuid:pk>/assignments/", EnquiryViewSet.as_view({"get": "assignments"}), name="enquiry-assignments"),
    path("<uuid:pk>/status-logs/", EnquiryViewSet.as_view({"get": "status_logs"}), name="enquiry-status-logs"),
    path("pending_enquiries/", PendingEnquiriesView.as_view(), name="pending-enquiries"),

    path("dashboard/", DashboardStatsView.as_view(), name="dashboard-stats"),

    path("agent-dashboard/", AgentDashboardView.as_view(), name="agent-dashboard"),
    path("agent-assignments/", AgentAssignmentsView.as_view(), name="agent-assignments"),
    path("agent/completed/", AgentCompletedView.as_view(), name="agent-completed"),

    path("engineer-dashboard/", EngineerDashboardView.as_view(), name="engineer-dashboard"),
    path("engineer-assignments/", EngineerAssignmentView.as_view(), name="engineer-assignments"),
    path("review-detail/<uuid:enquiry_id>/", EngineerReviewDetailView.as_view(), name="review-detail"),
    
]