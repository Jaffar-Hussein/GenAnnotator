from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CustomUser


class IsAnnotatorUser(BasePermission):

    message = "Annotator are not allowed to perform this action"

    def has_permission(self, request, view):

        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.annotator
        return False
        

class IsValidatorUser(BasePermission):

    message = "Validator are not allowed to perform this action"

    def has_permission(self, request, view):
        if isinstance(request.user, CustomUser):
            return request.user.role == CustomUser.validator
        return False
        
class ReadOnly(BasePermission):

    def has_permission(self, request, view):

        return request.method in SAFE_METHODS