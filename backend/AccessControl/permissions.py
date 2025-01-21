from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser
from GeneAtlas.models import GeneAnnotation, GeneAnnotationStatus

# Custom permission classes

# Check if the user is an annotator
class IsAnnotatorUser(BasePermission):

    # Message to display in case of failure
    message = "Annotator are not allowed to perform this action"

    def has_permission(self, request, view):

        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.annotator
        return False
    
    def has_object_permission(self, request, view, obj):
        # Read-only is allowed
        if request.method in SAFE_METHODS:
            return True
        # Staff can perform any action
        if request.user.is_staff:
            return True
        # Check if the user is the owner of the object
        if isinstance(obj,GeneAnnotation):
            return obj.status.annotator == request.user
        elif isinstance(obj,GeneAnnotationStatus):
            return obj.annotator == request.user
        
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
        