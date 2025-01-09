from django.urls import path
from .views import GenomeAPIView

urlpatterns = [
    path("api/genome/", GenomeAPIView.as_view(), name="genome_api"),
]