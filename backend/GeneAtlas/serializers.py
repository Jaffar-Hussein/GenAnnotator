from rest_framework import serializers
from AccessControl.models import CustomUser
from .models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus, AsyncTasksCache
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model

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
    
class GenomeQuerySerializer(serializers.Serializer):
    """Validates genome query parameters from user"""
    name = serializers.CharField(required=False, allow_null=True, max_length=100)
    species = serializers.CharField(required=False, allow_null=True, max_length=100)
    length = serializers.IntegerField(required=False, allow_null=True)
    motif = serializers.CharField(required=False, allow_null=True, max_length=100)
    gc_content = serializers.FloatField(required=False, allow_null=True)
    annotation = serializers.BooleanField(required=False, allow_null=True)

class GeneSerializer(serializers.ModelSerializer):
    """Formats gene data for API responses 
    / validates gene data from user before saving"""
    class Meta:
        model = Gene
        fields = '__all__'

class GeneQuerySerializer(serializers.Serializer):
    """Validates gene query parameters from user"""
    name = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[A-Z]{3}[0-9]+$", message="Invalid gene name")]) 
    genome = serializers.CharField(required=False, allow_null=True, max_length=100) 
    length = serializers.IntegerField(required=False, allow_null=True)
    gc_content = serializers.FloatField(required=False, allow_null=True) 
    annotated = serializers.BooleanField(required=False, allow_null=True) 
    limit = serializers.IntegerField(required=False, allow_null=True)
    sequence__icontains = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[CAGTcagt]+$", message="Invalid motif")])
    sequence__endswith = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[CAGTcagt]+$", message="Invalid motif")])
    sequence__startswith = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[CAGTcagt]+$", message="Invalid motif")])
    sequence__iexact = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[CAGTcagt]+$", message="Invalid motif")])

class PeptideSerializer(serializers.ModelSerializer):
    """Formats peptide data for API responses 
    / validates peptide data from user before saving"""
    class Meta:
        model = Peptide
        fields = '__all__'

class PeptideQuerySerializer(serializers.Serializer):
    """Validates peptide query parameters from user"""
    name = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[A-Z]{3}[0-9]+$", message="Invalid peptide name")])
    gene = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[A-Z]{3}[0-9]+$", message="Invalid gene name")])
    length = serializers.IntegerField(required=False, allow_null=True)
    gene__annotated = serializers.BooleanField(required=False, allow_null=True)
    limit = serializers.IntegerField(required=False, allow_null=True)
    sequence__icontains = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[ACDEFGHIKLMNPQRSTVWY]+$", message="Invalid motif")])
    sequence__endswith = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[ACDEFGHIKLMNPQRSTVWY]+$", message="Invalid motif")])
    sequence__startswith = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[ACDEFGHIKLMNPQRSTVWY]+$", message="Invalid motif")])
    sequence__iexact = serializers.CharField(required=False, allow_null=True, max_length=100, validators=[RegexValidator(regex=r"^[ACDEFGHIKLMNPQRSTVWY]+$", message="Invalid motif")])

class GeneAnnotationSerializer(serializers.ModelSerializer):
    """Formats gene annotation data for API responses 
    / validates gene annotation data from user before saving"""
    class Meta:
        model = GeneAnnotation
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
    
class GeneAnnotationStatusSerializer(serializers.ModelSerializer):
    """Formats annotation status data for API responses 
    / validates annotation status data from user before saving"""
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
    """Formats peptide annotation data for API responses"""
    class Meta:
        model = PeptideAnnotation
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
    
class TaskSerializer(serializers.ModelSerializer):
    """Formats task data for API responses"""
    class Meta:
        model = AsyncTasksCache
        fields = ["key", "task", "user", "state", "error_message", "created_at", "updated_at"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.user:
            representation["user"] = instance.user.username
        return representation

class TaskInputSerializer(serializers.Serializer):
    """Validates task query parameters from user"""
    key = serializers.UUIDField(required=False, allow_null=True)
    state = serializers.ChoiceField(required=False, choices=AsyncTasksCache.STATUS_CHOICES, allow_blank=True, allow_null=True)
    user = serializers.CharField(required=False, max_length=150, validators=[UnicodeUsernameValidator()], allow_null=True)
    task = serializers.ChoiceField(required=False, choices=["BLAST","PFAMScan"], allow_blank=True, allow_null=True)

class BlastQueryInputSerializer(serializers.Serializer):
    """Validates BLAST query parameters from user"""
    key = serializers.UUIDField(required=True)

class BlastRunInputSerializer(serializers.Serializer):
    """Validates BLAST run parameters from user"""
    gene = serializers.CharField(required=True, max_length=150, validators=[RegexValidator(regex=r"^[A-Z]{3}[0-9]+$", message="Invalid gene name")])
    program = serializers.ChoiceField(required=False, choices=["blastn","blastp","blastx","tblastn","tblastx"], allow_null=True)
    database = serializers.ChoiceField(required=False, choices=["nt","nr","refseq_rna","refseq_genomic","refseq_protein","swissprot","pdb","pat","env_nr","env_nt"], allow_null=True)
    evalue = serializers.FloatField(required=False, allow_null=True)

class StatsInputSerializer(serializers.Serializer):
    """Validates parameters from user"""
    user = serializers.CharField(required=False, max_length=150, validators=[UnicodeUsernameValidator()], allow_null=True)

class PFAMRunInputSerializer(serializers.Serializer):
    """Validates PFAM run parameters from user"""
    peptide = serializers.CharField(required=True, max_length=150, validators=[RegexValidator(regex=r"^[A-Z]{3}[0-9]+$", message="Invalid peptide name")])
    evalue = serializers.FloatField(required=False, allow_null=True)
    asp = serializers.BooleanField(required=False, allow_null=True)
    # user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=True)