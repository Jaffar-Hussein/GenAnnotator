from django.db.models.signals import post_save, pre_save
from django.db.models import Count
from django.dispatch import receiver
from .models import Genome, Gene, GeneAnnotationStatus, GeneAnnotation
from .tasks import send_annotation_mail


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
                send_annotation_mail(obj=instance, mail_type='update')
            elif instance.status == GeneAnnotationStatus.APPROVED:
                Gene.objects.filter(pk=instance.gene.pk).update(annotated=True)
                send_annotation_mail(obj=instance, mail_type='update')   
    except GeneAnnotationStatus.DoesNotExist:
        pass

@receiver(post_save, sender=GeneAnnotationStatus)
def update_genome_status(sender, instance, created, **kwargs):
    """Check if genome is fully annotated"""
    try:
        if isinstance(instance, GeneAnnotationStatus):
            manager = Genome.objects.filter(pk=instance.gene.genome.pk)
            if(manager.count() == 1):
                genome = manager.first()
                if not created:
                    if instance.status == GeneAnnotationStatus.REJECTED or instance.status == GeneAnnotationStatus.APPROVED:
                        status_counts = GeneAnnotationStatus.objects.values(
                            'gene__genome', 
                            'status'
                        ).filter(gene__genome=genome).annotate(
                            count=Count('status')
                        )
                        if len(status_counts) == 1 and status_counts[0]['status'] == GeneAnnotationStatus.APPROVED:
                            manager.update(annotation=True)
                        else:
                            manager.update(annotation=False)
                elif created:
                    manager.update(annotation=False)
            else:
                pass
    except Genome.DoesNotExist:
        pass
    

@receiver(post_save, sender=GeneAnnotation)
#@receiver(post_save, sender=PeptideAnnotation)
def reset_rejected_status_if_updated(sender, instance, created, **kwargs):
    """
    If an annotation is added/updated and its status was REJECTED / SUBMITTED, reset it to ONGOING.
    """
    try:
        existing_status = GeneAnnotationStatus.objects.get(gene=instance.gene_instance)

        if existing_status.status == GeneAnnotationStatus.REJECTED or existing_status.status == GeneAnnotationStatus.PENDING:
            existing_status.reset()

    except GeneAnnotationStatus.DoesNotExist:
        pass