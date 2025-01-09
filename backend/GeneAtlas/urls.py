from django.urls import path
from .views import GenomeAPIView, GeneAPIView, PeptideAPIView

urlpatterns = [
    path("api/genome/", GenomeAPIView.as_view(), name="genome_api"),
    path("api/gene/", GeneAPIView.as_view(), name="gene_api"),
    path("api.peptide/", PeptideAPIView.as_view(), name="peptide_api"),
]