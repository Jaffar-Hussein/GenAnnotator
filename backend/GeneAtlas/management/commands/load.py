from django.core.management.base import BaseCommand
from django.db.models.signals import post_save
from GeneAtlas.signals import create_gene_status, update_genome_status
from GeneAtlas.models import Genome, Gene, Peptide, GeneAnnotation, PeptideAnnotation, GeneAnnotationStatus
from AccessControl.models import CustomUser
from Bio import SeqIO
import os, glob
from django.db import transaction


class Command(BaseCommand):
    help = 'Load initial Fasta data'

    def parser(description: str):

        header, annotation = {}, {}

        key = None

        all_inf = description.split()

        seq_inf = all_inf[2].split(":")

        header["id"] = all_inf[0]

        header["type"] = all_inf[1]

        if len(all_inf) > 3:

            header["identifier"] = all_inf[0] + " " + all_inf[1] + " " + ":".join(seq_inf[:-1])

            header["start"] = seq_inf[-3]

            header["end"] = seq_inf[-2]

            annotation["strand"] = (seq_inf[-1])

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
        
        else:

            header["identifier"] =  description

            header["start"] = seq_inf[-2]

            header["end"] = seq_inf[-1]
        
        return [header, annotation]

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
                GeneAnnotation.objects.all().delete()

                post_save.disconnect(create_gene_status, sender=Gene)
                post_save.disconnect(update_genome_status, sender=GeneAnnotationStatus)

                for genome_file in genomes_files:

                    genome = (genome_file.split("/")[-1]).split(".")[0]

                    self.stdout.write("Genome: " + genome)

                    cds_file = relpath + genome + "_" + keywords[0] + "." + extension

                    self.stdout.write("CDS: " + cds_file)

                    peptide_file = relpath + genome + "_" + keywords[1] + "." + extension

                    self.stdout.write("Peptide: " + peptide_file, ending="\n")

                    # Parse Genome
                    for seq_record in SeqIO.parse(genome_file, "fasta"):
                        if(genome == "new_coli"):
                            Genome(name = str(genome), species = "eColi", header = seq_record.description, sequence = str(seq_record.seq).encode()).save()
                        else:
                            Genome(name = str(genome), species = "eColi", header = seq_record.description, sequence = str(seq_record.seq).encode(), annotation = True).save()

                    # Parse CDS
                    for seq_record in SeqIO.parse(cds_file, "fasta"):
                        kwargs_description = Command.parser(seq_record.description)
                        genome_instance = Genome.objects.get(name = genome)
                        gene = Gene(name = seq_record.id, genome = genome_instance, header = kwargs_description[0]["identifier"], sequence = str(seq_record.seq), start = kwargs_description[0]["start"], end = kwargs_description[0]["end"], annotated = (len(kwargs_description[1]) > 0))
                        gene.save()
                        if(len(kwargs_description[1]) > 0):
                            status = GeneAnnotationStatus(gene = gene, annotator = CustomUser.objects.get(pk=1), status = "APPROVED")
                            status.save()
                            GeneAnnotation(gene_instance = gene, status=status, **kwargs_description[1]).save()
                        else:
                            status = GeneAnnotationStatus(gene = gene)
                            status.save()
                            GeneAnnotation(gene_instance = gene, status=status).save()

                    # Parse Peptide
                    for seq_record in SeqIO.parse(peptide_file, "fasta"):
                        kwargs_description = Command.parser(seq_record.description)
                        gene_instance = Gene.objects.get(name = seq_record.id)
                        Peptide(name = seq_record.id, gene = gene_instance, header = kwargs_description[0]["identifier"], sequence = str(seq_record.seq)).save()
                        if(len(kwargs_description[1]) > 0):
                            PeptideAnnotation(peptide = Peptide.objects.get(name = seq_record.id), annotation = GeneAnnotation.objects.get(gene_instance = gene_instance), transcript = (kwargs_description[1])["transcript"]).save()

            post_save.connect(create_gene_status, sender=Gene)
            post_save.connect(update_genome_status, sender=GeneAnnotationStatus)

            self.stdout.write("Data loaded successfully...")
        
        except Exception as e:
            self.stdout.write("Error: " + str(e))
            self.stdout.write("Data not loaded...")