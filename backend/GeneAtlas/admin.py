from django.contrib import admin
from .models import Genome, Gene, Peptide, Annotation
# Register your models here.

admin.site.register([Genome, Gene, Peptide, Annotation])
