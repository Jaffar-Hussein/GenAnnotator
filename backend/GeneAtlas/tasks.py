from huey.contrib.djhuey import task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import GeneAnnotationStatus

@task()
def send_annotation_mail(obj: GeneAnnotationStatus, mail_type: str) -> int:

        if mail_type == "assigned":
            template = "email_annotation_assigned"
        elif mail_type == "update":
            template = "email_annotation_update"

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