from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email
from phonenumber_field.modelfields import PhoneNumberField

class CustomUser(AbstractUser):

    # Additional fields
    email = models.EmailField(max_length=254, unique=True, blank=False, null=False, validators=[validate_email])
    phone_number = PhoneNumberField(blank=True)
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

    def __str__(self):
        return f"{self.username}, {self.email}, {self.role}"