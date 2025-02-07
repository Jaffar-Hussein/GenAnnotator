from functools import wraps

from rest_framework import status
from rest_framework.response import Response

from AccessControl.models import CustomUser


def validator_only():
    def decorator(func):
        @wraps(func)
        def wrapper(obj, request, *args, **kwargs):
            if request.user.role == CustomUser.validator:
                return func(obj, request, *args, **kwargs)
            else:
                return Response({'error': f'User with role {request.user.role} cannot perform this action'}, status=status.HTTP_403_FORBIDDEN)
        return wrapper
    return decorator