from datetime import timedelta
from django.utils import timezone
from huey.contrib.djhuey import task, db_periodic_task, signal
import huey.signals as signals
from huey import crontab
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import GeneAnnotationStatus, AsyncTasksCache
from Bio import SeqIO
from Bio import Blast
import json
from zipfile import ZipFile
import io

# Signals for the async tasks

@signal(signals.SIGNAL_COMPLETE)
def task_success(signal, task):
    if(task.name in ["run_blast"]):
        AsyncTasksCache.objects.filter(storage=task.id).update(state=AsyncTasksCache.completed)
    else:
        pass

@signal(signals.SIGNAL_ERROR)
def task_failure(signal, task, exc):
    if(task.name in ["run_blast"]):
        AsyncTasksCache.objects.filter(storage=task.id).update(state=AsyncTasksCache.failed, error_message = str(exc))
    else:
        pass

@signal(signals.SIGNAL_EXECUTING)
def task_start(signal, task):
    if(task.name in ["run_blast"]):
        AsyncTasksCache.objects.filter(storage=task.id).update(state=AsyncTasksCache.in_progress)
    else: 
        pass

@task()
def send_annotation_mail(obj: GeneAnnotationStatus, mail_type: str) -> int:

    # Define the template based on the mail type
    if mail_type == "assigned":
        template = "email_annotation_assigned"
    elif mail_type == "update":
        template = "email_annotation_update"

    # Define the context for the email
    context = {"user" : obj.annotator, 
                "anotation": obj.gene,
                "status": obj.status}

    # Render the text content.
    text_content = render_to_string(
        template_name=f"emails/{template}.txt",
        context=context,
    )

    # Render the HTML content.
    html_content = render_to_string(
        template_name=f"emails/{template}.html",
        context=context,
    )

    # Create a multipart email instance.
    msg = EmailMultiAlternatives(
        subject="Annotation Update",
        body=text_content,
        to=[obj.annotator.email],
    )

    # Attach the HTML content to the email instance and send.
    msg.attach_alternative(html_content, "text/html")
    return msg.send()

@task()
def run_blast(sequence, program, database, evalue):
    
    # Call the BLAST service with the provided parameters
    blast_result = Blast.qblast(program=program, database=database, sequence=sequence, expect=evalue, format_type="JSON2")
    raw_bytes = blast_result.read()

    try:
        # Open the zip archive in memory
        with ZipFile(io.BytesIO(raw_bytes), 'r') as zf:
            file = zf.namelist()[1]
            unzipped_bytes = zf.read(file)

        # Decode and parse JSON
        unzipped_str = unzipped_bytes.decode('utf-8')
        result = json.loads(unzipped_str)

        return result

    except Exception as e:
        return {"error": str(e)}
    
@db_periodic_task(crontab(minute='*/60'))
def check_task_sync():

    # Check if tasks has been in the database for more than time limit
    AsyncTasksCache.objects.filter(updated_at__lt=timezone.now() - timedelta(hours=24)).delete()
