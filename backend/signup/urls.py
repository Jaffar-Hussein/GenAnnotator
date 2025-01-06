from django.urls import path

from .views import SignUpView, SignupAPIView


urlpatterns = [
    path("api/new/", SignupAPIView.as_view(), name="signup_api"),
    path("new/", SignUpView.as_view(), name="signup"),
]