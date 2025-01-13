from django.urls import path
from django.views.generic.base import TemplateView
from .views import GenomeAPIView, GeneAPIView, PeptideAPIView, AnnotationAPIView, StatsAPIView, DownloadAPIView, HomeView

urlpatterns = [
    path("", HomeView.home_rendering, name="home"),
    path("api/genome/", GenomeAPIView.as_view(), name="genome_api"),
    path("api/gene/", GeneAPIView.as_view(), name="gene_api"),
    path("api/peptide/", PeptideAPIView.as_view(), name="peptide_api"),
    path("api/annotation/", AnnotationAPIView.as_view(), name="annotation_api"),
    path("api/stats/", StatsAPIView.as_view(), name="stats_api"),
    path("api/download/", DownloadAPIView.as_view(), name="download_api"),
]