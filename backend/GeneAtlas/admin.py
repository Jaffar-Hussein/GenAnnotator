from django.contrib import admin
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus
from .forms import GenomeAdminForm
from zlib import decompress
# Register your models here.

class CustomGenomeAdmin(admin.ModelAdmin):

    form = GenomeAdminForm

admin.site.register([Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus])
admin.site.register(Genome, CustomGenomeAdmin)
