from django.urls import path

from .views import SignUpView, SignupAPIView, LoginAPIView


urlpatterns = [
    path("api/new/", SignupAPIView.as_view(), name="signup_api"),
    path("api/login/", LoginAPIView.as_view(), name="login_api"),
    path("new/", SignUpView.as_view(), name="signup"),
]