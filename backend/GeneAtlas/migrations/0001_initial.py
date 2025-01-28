# Generated by Django 5.0.9 on 2025-01-27 06:16

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Genome",
            fields=[
                (
                    "name",
                    models.CharField(
                        max_length=100, primary_key=True, serialize=False, unique=True
                    ),
                ),
                ("species", models.CharField(max_length=100)),
                ("header", models.TextField(default=">Genome")),
                ("sequence", models.BinaryField(editable=True)),
                ("length", models.IntegerField(default=0, editable=False)),
                ("gc_content", models.FloatField(default=0.0, editable=False)),
                ("annotation", models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name="AsyncTasksCache",
            fields=[
                (
                    "key",
                    models.CharField(max_length=100, primary_key=True, serialize=False),
                ),
                (
                    "storage",
                    models.CharField(
                        blank=True, max_length=100, null=True, unique=True
                    ),
                ),
                ("task", models.CharField(max_length=100)),
                ("params_hash", models.CharField(db_index=True, max_length=100)),
                ("params", models.JSONField(blank=True, null=True)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending"),
                            ("IN_PROGRESS", "In Progress"),
                            ("COMPLETED", "Completed"),
                            ("REJECTED", "Rejected"),
                        ],
                        default="PENDING",
                        max_length=20,
                    ),
                ),
                ("error_message", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Gene",
            fields=[
                (
                    "name",
                    models.CharField(max_length=100, primary_key=True, serialize=False),
                ),
                ("start", models.IntegerField()),
                ("end", models.IntegerField()),
                ("header", models.TextField(default=">Gene")),
                ("sequence", models.TextField()),
                ("length", models.IntegerField(editable=False)),
                ("gc_content", models.FloatField(default=0.0, editable=False)),
                ("annotated", models.BooleanField(default=False)),
                (
                    "genome",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="GeneAtlas.genome",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Peptide",
            fields=[
                (
                    "name",
                    models.CharField(
                        default="Peptide",
                        max_length=100,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("header", models.TextField(default=">Peptide")),
                ("sequence", models.TextField()),
                ("length", models.IntegerField(editable=False)),
                (
                    "gene",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="GeneAtlas.gene"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="GeneAnnotationStatus",
            fields=[
                (
                    "gene",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to="GeneAtlas.gene",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("RAW", "Raw"),
                            ("ONGOING", "Ongoing"),
                            ("PENDING", "Pending"),
                            ("APPROVED", "Approved"),
                            ("REJECTED", "Rejected"),
                        ],
                        default="RAW",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(blank=True, null=True)),
                ("validated_at", models.DateTimeField(blank=True, null=True)),
                ("rejection_reason", models.TextField(blank=True, null=True)),
                (
                    "annotator",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-updated_at"],
            },
        ),
        migrations.CreateModel(
            name="GeneAnnotation",
            fields=[
                (
                    "gene_instance",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to="GeneAtlas.gene",
                    ),
                ),
                ("strand", models.IntegerField(blank=True, default=1, null=True)),
                (
                    "gene",
                    models.TextField(
                        blank=True, default="No gene provided.", null=True
                    ),
                ),
                (
                    "gene_biotype",
                    models.TextField(
                        blank=True, default="No gene biotype provided.", null=True
                    ),
                ),
                (
                    "transcript_biotype",
                    models.TextField(
                        blank=True, default="No transcript biotype provided.", null=True
                    ),
                ),
                (
                    "gene_symbol",
                    models.TextField(
                        blank=True, default="No gene symbol provided.", null=True
                    ),
                ),
                (
                    "description",
                    models.TextField(
                        blank=True, default="No description provided.", null=True
                    ),
                ),
                ("is_current", models.BooleanField(default=True)),
                (
                    "status",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="annotations",
                        to="GeneAtlas.geneannotationstatus",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="PeptideAnnotation",
            fields=[
                (
                    "peptide",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to="GeneAtlas.peptide",
                    ),
                ),
                ("transcript", models.TextField(default="No transcript provided.")),
                (
                    "annotation",
                    models.OneToOneField(
                        default="No annotation provided.",
                        on_delete=django.db.models.deletion.CASCADE,
                        to="GeneAtlas.geneannotation",
                    ),
                ),
            ],
        ),
    ]
