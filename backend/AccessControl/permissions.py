from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser

# Custom permission classes

# Check if the user is an annotator
class IsAnnotatorUser(BasePermission):

    # Message to display in case of failure
    message = "Annotator are not allowed to perform this action"

    def has_permission(self, request, view):

        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.annotator
        return False
        
# Check if the user is a validator
class IsValidatorUser(BasePermission):

    # Message to display in case of failure
    message = "Validator are not allowed to perform this action"

    def has_permission(self, request, view):
        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.validator
        return False
        
# Check request method
class ReadOnly(BasePermission):

    def has_permission(self, request, view):

        return request.method in SAFE_METHODS