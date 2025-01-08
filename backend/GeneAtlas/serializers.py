from rest_framework import serializers
from .models import Genome, Gene, Peptide, Annotation

class GenomeSerializer(serializers.ModelSerializer):
    sequence = serializers.CharField(write_only=True)
    class Meta:
        model = Genome
        fields = '__all__'

    def create(self, data):
        sequence = data.get('sequence', '')
        if sequence:
            data['sequence'] = sequence.encode()
        return super().create(data)

    def update(self, instance, data):
        sequence = data.get('sequence', '')
        if sequence:
            data['sequence'] = sequence.encode()
        return super().update(instance, data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['sequence'] = instance.get_sequence()
        return representation

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

