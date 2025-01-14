from rest_framework import serializers
from AccessControl.models import CustomUser
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus

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

class GeneAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneAnnotation
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user"] = instance.user.username
        return representation
    
class GeneAnnotationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneAnnotationStatus
        fields = '__all__'
        read_only_fields = ('status',)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.annotator:
            representation["annotator"] = instance.annotator.username
        return representation

class PeptideAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeptideAnnotation
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user"] = instance.user.username
        return representation