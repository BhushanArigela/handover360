from django.urls import path
from .views import create_user, UserListView, ToggleUserStatus, VerifyOTP, login_user, update_user

urlpatterns = [
    path("login/", login_user, name="login-user"),
    path('create/', create_user),
    path("verify-otp/", VerifyOTP.as_view()),
    path('all_users/', UserListView.as_view()),
    path("<uuid:pk>/toggle/", ToggleUserStatus.as_view()),
    path("<uuid:user_id>/", update_user, name="update_user"),
]