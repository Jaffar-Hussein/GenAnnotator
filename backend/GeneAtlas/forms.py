from django import forms
from .models import Genome
from zlib import compress, decompress

class GenomeAdminForm(forms.ModelForm):

    sequence = forms.CharField(widget=forms.Textarea, required=True)

    class Meta:
        model = Genome
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.sequence:
            self.initial['sequence'] = decompress(self.instance.sequence).decode('utf-8')
    
    def clean_sequence(self):
        return self.cleaned_data['sequence'].encode('utf-8')