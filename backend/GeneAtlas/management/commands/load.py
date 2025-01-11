from django.core.management.base import BaseCommand
from GeneAtlas.models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation
from Bio import SeqIO
import os, glob
from django.db import transaction


class Command(BaseCommand):
    help = 'Load initial Fasta data'

    def parser(description: str):

        annotation = {}

        key = None

        all_inf = description.split()

        if len(all_inf) > 3:

            annotation["strand"] = (all_inf[2].split(":")[-1])

            for inf in all_inf[3:]:
                if((":" in inf) and  (not "description" in annotation)):
                    key_value_pair = inf.split(":")
                    if(len(key_value_pair) > 2):
                        key, value = key_value_pair[0], ":".join(key_value_pair[1:])
                    else:
                        key, value = key_value_pair
                    annotation[key] = value
                else:
                    if(key == "description"):
                        annotation[key] = annotation[key] + " " + inf
        
        return annotation

    def handle(self, *args, **kwargs):

        self.stdout.write("Running load.py script...", ending="\n")

        keywords = ["cds","pep"]
        extension = "fa"
        relpath = "./data/"

        genomes_files = [file for file in glob.glob(f"{relpath}*.{extension}") if not any(keyword in file for keyword in keywords)]

        try:
            with transaction.atomic():

                Genome.objects.all().delete()
                Gene.objects.all().delete()
                Peptide.objects.all().delete()

                for genome_file in genomes_files:

                    genome = (genome_file.split("/")[-1]).split(".")[0]

                    self.stdout.write("Genome: " + genome)

                    cds_file = relpath + genome + "_" + keywords[0] + "." + extension

                    self.stdout.write("CDS: " + cds_file)

                    peptide_file = relpath + genome + "_" + keywords[1] + "." + extension

                    self.stdout.write("Peptide: " + peptide_file, ending="\n")

                    # Parse Genome
                    for seq_record in SeqIO.parse(genome_file, "fasta"):
                        Genome(name = str(genome), species = "eColi", header = seq_record.description, sequence = str(seq_record.seq).encode()).save()

                    # Parse CDS
                    for seq_record in SeqIO.parse(cds_file, "fasta"):
                        kwargs_description = Command.parser(seq_record.description)
                        genome_instance = Genome.objects.get(name = genome)
                        Gene(name = seq_record.id, genome = genome_instance, header = seq_record.description, sequence = str(seq_record.seq), start = 0, end = len(seq_record.seq), annotated = (len(kwargs_description) > 0)).save()
                        if(len(kwargs_description) > 0):
                            GeneAnnotation(gene_instance = Gene.objects.get(name = seq_record.id), **kwargs_description).save()

                    # Parse Peptide
                    for seq_record in SeqIO.parse(peptide_file, "fasta"):
                        kwargs_description = Command.parser(seq_record.description)
                        gene_instance = Gene.objects.get(name = seq_record.id)
                        Peptide(name = seq_record.id, gene = gene_instance, header = seq_record.description, sequence = str(seq_record.seq)).save()
                        if(len(kwargs_description) > 0):
                            PeptideAnnotation(peptide = Peptide.objects.get(name = seq_record.id), annotation = GeneAnnotation.objects.get(gene_instance = gene_instance), transcript = kwargs_description["transcript"]).save()

            self.stdout.write("Data loaded successfully...")
        
        except Exception as e:
            self.stdout.write("Error: " + str(e))
            self.stdout.write("Data not loaded...")