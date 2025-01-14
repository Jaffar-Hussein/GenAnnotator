from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Gene, GeneAnnotationStatus, GeneAnnotation, PeptideAnnotation

@receiver(post_save, sender=Gene)
def create_gene_status(sender, instance, created, **kwargs):
    """Create initial pending status when new gene is created /
    Create Gene Annotation when new gene is created"""
    if created:
        status = GeneAnnotationStatus.objects.create(gene=instance)
        GeneAnnotation.objects.create(gene_instance=instance, status=status, is_current=True)

@receiver(pre_save, sender=GeneAnnotationStatus)
def handle_status_change(sender, instance, **kwargs):
    """Handle status updates before saving"""
    try:
        original = GeneAnnotationStatus.objects.get(pk=instance.pk)
        if original.status != instance.status:
            
            if instance.status == GeneAnnotationStatus.REJECTED:
                Gene.objects.filter(pk=instance.gene.pk).update(annotated=False)
            
            elif instance.status == GeneAnnotationStatus.APPROVED:
                Gene.objects.filter(pk=instance.gene.pk).update(annotated=True)

    except GeneAnnotationStatus.DoesNotExist:
        pass

@receiver(post_save, sender=GeneAnnotation)
#@receiver(post_save, sender=PeptideAnnotation)
def reset_rejected_status_if_updated(sender, instance, created, **kwargs):
    """
    If an annotation is added/updated and its status was REJECTED, reset it to PENDING.
    """
    try:
        existing_status = GeneAnnotationStatus.objects.get(gene=instance.gene_instance)

        if existing_status.status == GeneAnnotationStatus.REJECTED:
            existing_status.reset()

    except GeneAnnotationStatus.DoesNotExist:
        pass