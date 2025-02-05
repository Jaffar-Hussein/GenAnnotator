from datetime import timedelta
from django.utils import timezone
from huey.contrib.djhuey import task, db_periodic_task, signal
import huey.signals as signals
from huey import crontab
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import GeneAnnotationStatus, AsyncTasksCache
from AccessControl.models import CustomUser
from Bio import SeqIO
from Bio import Blast
import json
from zipfile import ZipFile
import io
import requests
from time import sleep

# Signals for the async tasks

@signal(signals.SIGNAL_COMPLETE)
def task_success(signal, task):
    if(task.name in ["run_blast","pfamscan"]):
        AsyncTasksCache.objects.filter(storage=task.id).update(state=AsyncTasksCache.completed)
    else:
        pass

@signal(signals.SIGNAL_ERROR)
def task_failure(signal, task, exc):
    if(task.name in ["run_blast","pfamscan"]):
        AsyncTasksCache.objects.filter(storage=task.id).update(state=AsyncTasksCache.rejected, error_message = str(exc))
    else:
        pass

@signal(signals.SIGNAL_EXECUTING)
def task_start(signal, task):
    if(task.name in ["run_blast","pfamscan"]):
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

@task()
def pfamscan(sequence: str, evalue: float, asp: bool, user) -> dict:

    # Endpoints of the API
    RUN_URL = "https://www.ebi.ac.uk/Tools/services/rest/pfamscan/run/"
    STATUS_URL = "https://www.ebi.ac.uk/Tools/services/rest/pfamscan/status/"
    RESULT_URL = "https://www.ebi.ac.uk/Tools/services/rest/pfamscan/result/"

    # User who requested the job
    user_obj = CustomUser.objects.get(id=user)

    # Parameters to run the job
    run_data = {"email": user_obj.email, 
                "title": f"PFAMScan - {user_obj.username}", 
                "sequence": sequence, 
                "database": "pfam-a", 
                "evalue": evalue, 
                "asp": asp, 
                "format": "json"}

    # Run the job
    req = requests.post(RUN_URL, data=run_data)

    # Handle the request status code
    try:
        req.raise_for_status()
        if req.status_code == 200:
            # Retrieve the job ID
            job = req.text
        else:
            return {"status": str(req.status_code) + " - " + req.reason}
    except requests.exceptions.HTTPError as e:
        return {"error": + str(e)}

    # Number of call made to the API to check the status of the job
    attempts = 0

    # Attempt threshold to avoid infinite loop
    attempts_threshold = 10

    # Check the status of the job
    if requests.get(STATUS_URL + job).text != "FINISHED":
        
        attempts += 1

        # Wait for the job to finish
        sleep(61)

        # Make further calls to the API to check the status of the job
        # Check the status of the job every 1 minute
        while requests.get(STATUS_URL + job).text != "FINISHED":

            attempts += 1

            sleep(61)

            if attempts > attempts_threshold:
                return {"error": "The job has been running for too long"}

    # If code reaches this point, the job is finished
    # Retrieve the result of the job
    result = requests.get(RESULT_URL + job + "/out")

    # Handle the result
    try:
        result.raise_for_status()
        if result.status_code == 200:
            return result.json()
        else:
            return {"status": + str(result.status_code) + " - " + result.reason}
    except requests.exceptions.HTTPError as e:
        return {"error": str(e)}