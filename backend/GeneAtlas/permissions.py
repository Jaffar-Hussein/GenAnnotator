from rest_framework.permissions import SAFE_METHODS, BasePermission

from AccessControl.models import CustomUser

from .models import Gene, GeneAnnotation, GeneAnnotationStatus, Peptide

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
        elif isinstance(obj,Peptide):
            return GeneAnnotation.objects.get(gene_instance=obj.gene).status.annotator == request.user
        elif isinstance(obj,Gene):
            return GeneAnnotation.objects.get(gene_instance=obj).status.annotator == request.user
        
# Check if the user is a validator
class IsValidatorUser(BasePermission):

    # Message to display in case of failure
    message = "Validator are not allowed to perform this action"

    def has_permission(self, request, view):
        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.validator
        return False
        