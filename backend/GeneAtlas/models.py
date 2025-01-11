from django.db import models
from AccessControl.models import CustomUser
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from zlib import compress, decompress

# Create your models here.

class Genome(models.Model):
    name = models.CharField(max_length=100, unique=True, primary_key=True)
    species = models.CharField(max_length=100)
    description = models.TextField(blank=True)
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
    description = models.TextField(blank=True, null=False)
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
    
class Peptide(models.Model):
    name = models.CharField(max_length=100, default="Peptide", primary_key=True)
    gene = models.ForeignKey(Gene, on_delete=models.CASCADE)
    header = models.TextField(blank=False, null=False, default=">Peptide")
    sequence = models.TextField()
    length = models.IntegerField(editable=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        return super().save(*args, **kwargs)
    
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
    
class GeneAnnotation(models.Model):
    gene_instance = models.OneToOneField(Gene, on_delete=models.CASCADE, primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=1)
    date = models.DateTimeField(auto_now_add=True)
    annotation = models.TextField(blank=False, null=False, editable=True, default="No annotation provided.")
    strand = models.IntegerField(default=1)
    gene = models.TextField(blank=False, null=False, editable=True, default="No gene provided.")
    gene_biotype = models.TextField(blank=False, null=False, editable=True, default="No gene biotype provided.")
    transcript_biotype = models.TextField(blank=False, null=False, editable=True, default="No transcript biotype provided.")
    gene_symbol = models.TextField(blank=False, null=False, editable=True, default="No gene symbol provided.")
    description = models.TextField(blank=False, null=False, editable=True, default="No description provided.")


    def __str__(self):
        return f"{str(self.gene)}, {self.user}, {self.date}"

class PeptideAnnotation(models.Model):
    peptide = models.OneToOneField(Peptide, on_delete=models.CASCADE, primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=1)
    date = models.DateTimeField(auto_now_add=True)
    annotation = models.OneToOneField(GeneAnnotation,blank=False, null=False, editable=True, on_delete=models.CASCADE, default="No annotation provided.")
    transcript = models.TextField(blank=False, null=False, editable=True, default="No transcript provided.")

    def __str__(self):
        return f"{str(self.peptide)}, {self.user}, {self.date}"