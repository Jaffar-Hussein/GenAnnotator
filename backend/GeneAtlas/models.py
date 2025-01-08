from django.db import models
from AccessControl.models import CustomUser
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from zlib import compress, decompress

# Create your models here.

class Genome(models.Model):
    name = models.CharField(max_length=100, unique=True)
    species = models.CharField(max_length=100)
    description = models.TextField(blank=True)
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

    def __str__(self):
        return self.name
    
class Gene(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    genome = models.ForeignKey(Genome, on_delete=models.CASCADE)
    start = models.IntegerField()
    end = models.IntegerField()
    sequence = models.TextField()
    length = length = models.IntegerField(editable=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Peptide(models.Model):
    gene = models.ForeignKey(Gene, on_delete=models.CASCADE)
    sequence = models.TextField()
    length = models.IntegerField(editable=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.sequence

class Annotation(models.Model):
    gene = models.OneToOneField(Gene, on_delete=models.CASCADE, primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=1)