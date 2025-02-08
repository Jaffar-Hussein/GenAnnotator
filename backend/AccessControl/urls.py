from dj_rest_auth.registration.views import (
    ResendEmailVerificationView,
    VerifyEmailView,
)
from dj_rest_auth.views import (
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
)
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    LoginAPIView,
    SignupAPIView,
    SignUpView,
    UserAPIView,
    UserProfileAPIView,
)

# URL patterns for the AccessControl application
urlpatterns = [
    path("api/new/",
         SignupAPIView.as_view(),
         name="signup_api"),
    path("api/login/",
         LoginAPIView.as_view(),
         name="login_api"),
    path("new/",
         SignUpView.as_view(),
         name="signup"),
    path("api/user/password/change/",
         PasswordChangeView.as_view(),
         name="rest_password_change"),
    path("api/user/password/reset/",
         PasswordResetView.as_view(),
         name="rest_password_reset"),
    path("api/user/password/reset/confirm/",
         PasswordResetConfirmView.as_view(),
         name="rest_password_reset_confirm"),
    path("api/auth/token/verify/",
         TokenVerifyView.as_view(),
         name="token_verify"),
    path("api/auth/token/refresh/",
         TokenRefreshView.as_view(),
         name="token_refresh"),
    # path("api/user/verify-email/", VerifyEmailView.as_view(), name="rest_verify_email"),
    path("api/user/resend-email/",
         ResendEmailVerificationView.as_view(),
         name="rest_resend_email"),
    path("api/user/role/<str:user>",
         UserAPIView.as_view(),
         name="user_api_set"),
    path("api/user/",
         UserAPIView.as_view(),
         name="user_api_stats"),
    path("api/user/profile/",
         UserProfileAPIView.as_view(),
         name="user_profile_api"),
]
