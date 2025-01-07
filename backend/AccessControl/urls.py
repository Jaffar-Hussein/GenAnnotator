from django.urls import path

from .views import SignUpView, SignupAPIView, LoginAPIView
from dj_rest_auth.views import PasswordChangeView, PasswordResetView, PasswordResetConfirmView
from dj_rest_auth.registration.views import VerifyEmailView, ResendEmailVerificationView

urlpatterns = [
    path("api/new/", SignupAPIView.as_view(), name="signup_api"),
    path("api/login/", LoginAPIView.as_view(), name="login_api"),
    path("new/", SignUpView.as_view(), name="signup"),
    path("api/user/password/change/", PasswordChangeView.as_view(), name="rest_password_change"),
    #path("api/auth/password/reset/", PasswordResetView.as_view(), name="rest_password_reset"),
    #path("api/auth/password/reset/confirm/", PasswordResetConfirmView.as_view(), name="rest_password_reset_confirm"),
    #path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    #path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("dj-rest-auth/registration/verify-email/", VerifyEmailView.as_view(), name="rest_verify_email"),
    #path("/dj-rest-auth/registration/resend-email/", ResendEmailVerificationView.as_view(), name="rest_resend_email"),
]