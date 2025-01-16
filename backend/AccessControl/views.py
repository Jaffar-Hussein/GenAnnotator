from django.shortcuts import render

# Create your views here.

from .forms import SignupForm
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import SignUpSerializer, LoginSerializer, UserSerializer
from .models import CustomUser
from GeneAtlas.models import GeneAnnotation
from GeneAtlas.serializers import GeneAnnotationSerializer
from allauth.account.utils import send_email_confirmation
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser


class SignUpView(CreateView):
    form_class = SignupForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

class SignupAPIView(APIView):

    # Everyone can access this view

    # Method for POST requests
    def post(self, request, *args, **kwargs):
        serializer = SignUpSerializer(data=request.data)
        # Check if the serializer is valid
        if serializer.is_valid():
            # Create a new user with the validated data
            user = CustomUser(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                phone_number=serializer.validated_data['phone_number'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
            )
            # Use the set_password method to hash the password
            user.set_password(serializer.validated_data['password'])
            # Save the user
            user.save()
            # Send email confirmation
            send_email_confirmation(request, user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # If the serializer is not valid, return the errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginAPIView(APIView):

    # Everyone can access this view

    # Method for POST requests
    def post(self, request, *args, **kwargs):
        # Serialize the request data
        serializer = LoginSerializer(data=request.data)
        # Check if the serializer is valid
        if serializer.is_valid():
            # Get the username and password from the validated data
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            # Authenticate the user
            user = authenticate(username=username, password=password)
            # If authentication is successful, a user is returned
            if user is not None:
                # Create a token for the user
                refresh = RefreshToken.for_user(user)
                # Send back the user data and the token
                return Response({
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    #'phone_number': (user.phone_number).as_e164,
                    'role': user.role,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            # If authentication is not successful, return an error
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Methods not allowed

    def get(self, request, *args, **kwargs):
        return Response({"error": "GET request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request, *args, **kwargs):
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, *args, **kwargs):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class UserAPIView(APIView):

    # Authentificated admin users can access this view

    # Permission classes
    permission_classes = [IsAuthenticated|IsAdminUser]

    # Method for GET requests
    def get(self, request, *args, **kwargs):
        # Get all users
        users = CustomUser.objects.all()

        # Pagination
        paginator = LimitOffsetPagination()
        users = paginator.paginate_queryset(users, request)

        serializer = UserSerializer(users, many=True)

        return paginator.get_paginated_response(serializer.data)

    # Method for PUT requests
    def put(self, request, user, *args, **kwargs):
        # Get the user requested
        user = CustomUser.objects.get(username=user)
        # Get the new role to set
        new_role = request.data.get('role',None)
        # If role is provided, set the new role
        if new_role:
            # Call the setrole method from the user model
            if user.setrole(new_role):
                # Response if the role is updated
                return Response({"success": f"Role updated to {new_role}."}, status=status.HTTP_200_OK)
            else:
                # Response if the role provided is invalid
                return Response({"error": f"Invalid role provided {new_role}."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Response if the role is not provided in the request
            return Response({"error": "Role not provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Methods not allowed

    def post(self, request, *args, **kwargs):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, user_id, *args, **kwargs):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)