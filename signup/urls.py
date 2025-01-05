from django.urls import path

from .views import SignUpView


urlpatterns = [
    path("new/", SignUpView.as_view(), name="signup"),
]