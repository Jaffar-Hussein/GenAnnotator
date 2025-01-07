from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email

class CustomUser(AbstractUser):

    # Additional fields
    email = models.EmailField(max_length=254, unique=True, validators=[validate_email])
    reader = "READER"
    annotator = "ANNOTATOR"
    validator = "VALIDATOR"
    ROLE_CHOICES = [
        (reader, 'Reader'),
        (annotator, 'Annotator'),
        (validator, 'Validator'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='READER')
    last_login_time = models.DateTimeField(auto_now=True)