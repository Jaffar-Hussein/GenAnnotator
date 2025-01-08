from django.db import models

# Create your models here.

class Genome(models.Model):
    name = models.CharField(max_length=100, unique=True)
    species = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    sequence = models.TextField(blank=False, null=False)
    length = models.IntegerField(editable=False)

    def save(self, *args, **kwargs):
        self.length = len(self.sequence)
        return super().save(*args, **kwargs)

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