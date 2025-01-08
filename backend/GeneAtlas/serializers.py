from rest_framework import serializers
from .models import Genome, Gene, Peptide, Annotation

class GenomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genome
        fields = '__all__'

class GeneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gene
        fields = '__all__'

class PeptideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peptide
        fields = '__all__'

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'

