from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Genome, Gene, Peptide, GeneAnnotation, 
    PeptideAnnotation, GeneAnnotationStatus, AsyncTasksCache
)
from .forms import GenomeAdminForm

@admin.register(Genome)
class GenomeAdmin(admin.ModelAdmin):
    form = GenomeAdminForm
    list_display = ('name', 'species', 'length', 'gc_content', 'annotation')
    list_filter = ('species', 'annotation')
    search_fields = ('name', 'species')
    readonly_fields = ('length', 'gc_content')
    fieldsets = (
        (None, {
            'fields': ('name', 'species', 'header')
        }),
        (_('Sequence Information'), {
            'fields': ('sequence', 'length', 'gc_content', 'annotation')
        }),
    )

@admin.register(Gene)
class GeneAdmin(admin.ModelAdmin):
    list_display = ('name', 'genome', 'start', 'end', 'length', 'gc_content', 'annotated')
    list_filter = ('genome', 'annotated')
    search_fields = ('name', 'sequence')
    readonly_fields = ('length', 'gc_content')
    fieldsets = (
        (None, {
            'fields': ('name', 'genome', 'header')
        }),
        (_('Location'), {
            'fields': ('start', 'end')
        }),
        (_('Sequence Information'), {
            'fields': ('sequence', 'length', 'gc_content', 'annotated')
        }),
    )

@admin.register(Peptide)
class PeptideAdmin(admin.ModelAdmin):
    list_display = ('name', 'gene', 'length')
    list_filter = ('gene',)
    search_fields = ('name', 'sequence')
    readonly_fields = ('length',)
    fieldsets = (
        (None, {
            'fields': ('name', 'gene', 'header')
        }),
        (_('Sequence Information'), {
            'fields': ('sequence', 'length')
        }),
    )

@admin.register(GeneAnnotation)
class GeneAnnotationAdmin(admin.ModelAdmin):
    list_display = ('gene_instance', 'strand', 'gene_symbol', 'gene_biotype', 'is_current')
    list_filter = ('is_current', 'gene_biotype', 'transcript_biotype')
    search_fields = ('gene_instance__name', 'gene_symbol', 'description')
    raw_id_fields = ('gene_instance', 'status')
    fieldsets = (
        (None, {
            'fields': ('gene_instance', 'strand', 'is_current')
        }),
        (_('Annotation Details'), {
            'fields': ('gene', 'gene_biotype', 'transcript_biotype', 'gene_symbol', 'description')
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
    )

@admin.register(GeneAnnotationStatus)
class GeneAnnotationStatusAdmin(admin.ModelAdmin):
    list_display = ('gene', 'status', 'annotator', 'updated_at', 'validated_at')
    list_filter = ('status', 'annotator')
    search_fields = ('gene__name', 'rejection_reason')
    readonly_fields = ('created_at', 'updated_at', 'validated_at')
    raw_id_fields = ('gene', 'annotator')
    fieldsets = (
        (None, {
            'fields': ('gene', 'status', 'annotator')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at', 'validated_at'),
            'classes': ('collapse',)
        }),
        (_('Review Information'), {
            'fields': ('rejection_reason',),
            'classes': ('collapse',)
        }),
    )

@admin.register(PeptideAnnotation)
class PeptideAnnotationAdmin(admin.ModelAdmin):
    list_display = ('peptide', 'annotation', 'transcript')
    search_fields = ('peptide__name', 'transcript')
    raw_id_fields = ('peptide', 'annotation')

@admin.register(AsyncTasksCache)
class AsyncTasksCacheAdmin(admin.ModelAdmin):
    list_display = ('key', 'task', 'state', 'user', 'created_at', 'updated_at')
    list_filter = ('state', 'task', 'user')
    search_fields = ('key', 'task', 'error_message')
    readonly_fields = ('key', 'storage', 'params_hash', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('key', 'task', 'state', 'user')
        }),
        (_('Task Details'), {
            'fields': ('storage', 'params_hash', 'params')
        }),
        (_('Error Information'), {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )