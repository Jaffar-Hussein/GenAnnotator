from datetime import datetime
from django.db import models
from AccessControl.models import CustomUser
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from zlib import compress, decompress
from .decorators import validator_only
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

# Create your models here.

class Genome(models.Model):
    name = models.CharField(max_length=100, unique=True, primary_key=True)
    species = models.CharField(max_length=100)
    header = models.TextField(blank=False, null=False, default=">Genome")
    sequence = models.BinaryField(blank=False, null=False, editable=True)
    length = models.IntegerField(editable=False, default=0)
    gc_content = models.FloatField(editable=False, default=0.0)
    annotation = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        sequence_str = self.sequence.decode()
        self.length = len(sequence_str)
        self.gc_content = gc_fraction(Seq(sequence_str))
        self.sequence = compress(self.sequence)
        return super().save(*args, **kwargs)
    
    def get_sequence(self):
        return decompress(self.sequence).decode()
    
    def search_motif(self, motif):
        if(motif[0] == "%" and motif[-1] == "%"):
            return self.get_sequence().find(motif[1:-1]) != -1
        elif(motif[0] == "%"):
            return self.get_sequence().endswith(motif[1:])
        elif(motif[-1] == "%"):
            return self.get_sequence().startswith(motif[:-1])
        else:
            return False

    def __str__(self):
        return self.name
    
class Gene(models.Model):

    name = models.CharField(max_length=100, primary_key=True)
    genome = models.ForeignKey(Genome, on_delete=models.CASCADE)
    start = models.IntegerField(blank=False, null=False)
    end = models.IntegerField(blank=False, null=False)
    header = models.TextField(blank=False, null=False, default=">Gene")
    sequence = models.TextField()
    length = length = models.IntegerField(editable=False)
    gc_content = models.FloatField(editable=False, default=0.0)
    annotated = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        self.gc_content = gc_fraction(Seq(self.sequence))
        return super().save(*args, **kwargs)
    
    def query_motif(motif: str) -> str:
        if(motif):
            if(motif[0] == "%" and motif[-1] == "%"):
                return "sequence__icontains"
            elif(motif[0] == "%"):
                return "sequence__endswith"
            elif(motif[-1] == "%"):
                return "sequence__startswith"
            else:
                return "sequence__iexact"
        else:
            return "sequence__icontains"

    def __str__(self):
        return self.name
    
class Peptide(models.Model):
    name = models.CharField(max_length=100, default="Peptide", primary_key=True)
    gene = models.ForeignKey(Gene, on_delete=models.CASCADE)
    header = models.TextField(blank=False, null=False, default=">Peptide")
    sequence = models.TextField()
    length = models.IntegerField(editable=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        return super().save(*args, **kwargs)
    
    def query_motif(motif: str) -> str:
        if(motif):
            if(motif[0] == "%" and motif[-1] == "%"):
                return "sequence__icontains"
            elif(motif[0] == "%"):
                return "sequence__endswith"
            elif(motif[-1] == "%"):
                return "sequence__startswith"
            else:
                return "sequence__iexact"
        else:
            return "sequence__icontains"

    def __str__(self):
        return self.name
    
class GeneAnnotation(models.Model):
    gene_instance = models.OneToOneField(Gene, on_delete=models.CASCADE, primary_key=True)
    strand = models.IntegerField(blank=True, null=True, default=1)
    gene = models.TextField(blank=True, null=True, editable=True, default="No gene provided.")
    gene_biotype = models.TextField(blank=True, null=True, editable=True, default="No gene biotype provided.")
    transcript_biotype = models.TextField(blank=True, null=True, editable=True, default="No transcript biotype provided.")
    gene_symbol = models.TextField(blank=True, null=True, editable=True, default="No gene symbol provided.")
    description = models.TextField(blank=True, null=True, editable=True, default="No description provided.")
    is_current = models.BooleanField(default=True)
    status = models.OneToOneField('GeneAnnotationStatus', blank=True, null=True, on_delete=models.CASCADE, related_name='annotations')

    def save(self, *args, **kwargs):
        if self.is_current:
            GeneAnnotation.objects.filter(
                gene_instance=self.gene_instance,
                is_current=True
            ).update(is_current=False)
        if not self.status:
            self.status = GeneAnnotationStatus.objects.get(gene=self.gene_instance)
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{str(self.gene_instance)}"
    

class GeneAnnotationStatus(models.Model):

    def submit(self) -> Response:
        self.status = self.PENDING
        self.updated_at = datetime.now()
        self.save()
        return Response({'status': f'Annotation {self.gene} submitted'}, status=status.HTTP_200_OK)

    @validator_only()
    def reject(self, request, *args, **kwargs) -> Response:
        reason = request.data.get('reason', None)
        if not reason:
            return Response(
                {'error': 'Rejection reason required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        self.status = self.REJECTED
        self.rejection_reason = request.data.get('reason', None)
        self.updated_at = datetime.now()
        self.save()
        return Response({'status': f'Annotation {self.gene} rejected'}, status=status.HTTP_200_OK)

    @validator_only()
    def approve(self, request, *args, **kwargs) -> Response:
        self.status = self.APPROVED
        self.validated_at = datetime.now()
        self.updated_at = datetime.now()
        self.rejection_reason = None
        self.save()
        return Response({'status': f'Annotation {self.gene} approved'}, status=status.HTTP_200_OK)
    
    def reset(self):
        self.status = self.ONGOING
        self.validated_at = None
        self.rejection_reason = None
        self.updated_at = datetime.now()
        self.save()

    @validator_only()
    def setuser(self, request, *args, **kwargs) -> Response:
        if kwargs.get('user') is None:
            return Response(
                {'error': 'User required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            user = kwargs.get('user')
            self.status = self.ONGOING
            self.annotator = user
            self.updated_at = datetime.now()
            self.save()
            return Response({'status': f'Annotation {self.gene} assigned to {user}'}, status=status.HTTP_200_OK)


    def send_annotation_mail(self, mail_type):

        if mail_type == "assigned":
            template = "email_annotation_assigned"
        elif mail_type == "update":
            template = "email_annotation_update"

        context = {"user" : self.annotator, 
                   "anotation": self.gene,
                   "status": self.status}

        # Render the text content.
        text_content = render_to_string(
            template_name=f"emails/{template}.txt",
            context=context,
        )

        # Render the HTML content.
        html_content = render_to_string(
            template_name=f"emails/{template}.html",
            context=context,
        )

        # Create a multipart email instance.
        msg = EmailMultiAlternatives(
            subject="Annotation Update",
            body=text_content,
            to=[self.annotator.email],
        )

        # Attach the HTML content to the email instance and send.
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    RAW = 'RAW'
    ONGOING = 'ONGOING'
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'

    STATUS_CHOICES = [
        (RAW, 'Raw'),
        (ONGOING, 'Ongoing'),
        (PENDING, 'Pending'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
    ]

    gene = models.OneToOneField(Gene, on_delete=models.CASCADE, primary_key=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=RAW)
    annotator = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.gene} - {self.status} - {self.annotator}"

class PeptideAnnotation(models.Model):
    peptide = models.OneToOneField(Peptide, on_delete=models.CASCADE, primary_key=True)
    annotation = models.OneToOneField(GeneAnnotation,blank=False, null=False, editable=True, on_delete=models.CASCADE, default="No annotation provided.")
    transcript = models.TextField(blank=False, null=False, editable=True, default="No transcript provided.")

    def __str__(self):
        return f"{str(self.peptide)}"