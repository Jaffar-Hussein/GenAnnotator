from rest_framework.permissions import BasePermission, SAFE_METHODS

# Check request method
class ReadOnly(BasePermission):

    def has_permission(self, request, view):

        return request.method in SAFE_METHODS