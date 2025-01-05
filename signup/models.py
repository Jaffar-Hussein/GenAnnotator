from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):

    # Additional fields
    email = models.CharField(max_length=30, blank=True, null=True)
    reader = "READER"
    annotator = "ANNOTATOR"
    validator = "VALIDATOR"
    ROLE_CHOICES = [
        (reader, 'Reader'),
        (annotator, 'Annotator'),
        (validator, 'Validator'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='reader')
    last_login_time = models.DateTimeField(auto_now=True)