from django.contrib import admin
from .models import CustomUser

# Register model for the admin panel

admin.site.register(CustomUser)
