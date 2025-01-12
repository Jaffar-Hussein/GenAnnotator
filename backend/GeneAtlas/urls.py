from django.urls import path
from .views import GenomeAPIView, GeneAPIView, PeptideAPIView, AnnotationAPIView, StatsAPIView

urlpatterns = [
    path("api/genome/", GenomeAPIView.as_view(), name="genome_api"),
    path("api/gene/", GeneAPIView.as_view(), name="gene_api"),
    path("api/peptide/", PeptideAPIView.as_view(), name="peptide_api"),
    path("api/annotation/", AnnotationAPIView.as_view(), name="annotation_api"),
    path("api/stats/", StatsAPIView.as_view(), name="stats_api"),
]