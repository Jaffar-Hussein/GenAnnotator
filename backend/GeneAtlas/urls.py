from django.urls import path
from django.views.generic.base import TemplateView

from .views import (
    AnnotationAPIView,
    AnnotationStatusAPIView,
    BlastAPIView,
    DownloadAPIView,
    GeneAPIView,
    GenomeAPIView,
    HomeView,
    PeptideAPIView,
    PFAMAPIView,
    StatsAPIView,
    TaskAPIView,
)

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path("api/genome/", GenomeAPIView.as_view(), name="genome_api"),
    path("api/gene/", GeneAPIView.as_view(), name="gene_api"),
    path("api/peptide/", PeptideAPIView.as_view(), name="peptide_api"),
    path("api/annotation/", AnnotationAPIView.as_view(), name="annotation_api"),
    path("api/annotation/<str:gene>", AnnotationAPIView.as_view(), name="annotation_api_set"),
    path("api/stats/", StatsAPIView.as_view(), name="stats_api"),
    path("api/download/", DownloadAPIView.as_view(), name="download_api"),
    path("api/status/", AnnotationStatusAPIView.as_view(), name="status_api"),
    path("api/tasks/", TaskAPIView.as_view(), name="task_api"),
    path("api/blast/", BlastAPIView.as_view(), name="blast_api"),
    path("api/pfamscan/", PFAMAPIView.as_view(), name="pfamscan_api"),
]