from allauth.account.utils import send_email_confirmation
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import CreateView
from rest_framework import status
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .forms import SignupForm
from .models import CustomUser
from .permissions import ReadOnly
from .serializers import (
    LoginSerializer,
    SignUpSerializer,
    UserProfileSerializer,
    UserSerializer,
)

class SignUpView(CreateView):
    form_class = SignupForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

class SignupAPIView(APIView):

    # Everyone can access this view

    # Method for POST requests
    def post(self, request, *args, **kwargs) -> Response:
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
            # Validate the password
            try:
                validate_password(password=serializer.validated_data['password'], user=user)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
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
    def post(self, request, *args, **kwargs) -> Response:
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

    def get(self, request, *args, **kwargs) -> Response:
        return Response({"error": "GET request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request, *args, **kwargs) -> Response :
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, *args, **kwargs) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class UserAPIView(APIView):

    # Authentificated admin users can access this view

    # Permission classes
    permission_classes = [IsAuthenticated&(IsAdminUser|ReadOnly)]

    # Method for GET requests
    def get(self, request, *args, **kwargs) -> Response:
        # Get all users
        users = CustomUser.objects.all()

        # Query parameters
        params = {"username": request.GET.get('username',None),
                  "role": request.GET.get('role', None)}
        
        if(not all(value is None for value in params.values())):
            # Filter the users based on the query parameters
            users = users.filter(**{k: v for k, v in params.items() if v is not None})
            if(users.count() == 0):
                return Response({"error": "No users found with query parameters provided."}, status=status.HTTP_404_NOT_FOUND)
        
        # Pagination
        if(request.GET.get('limit',None)):
            paginator = LimitOffsetPagination()
            users = paginator.paginate_queryset(users, request)
            serializer = UserSerializer(users, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            # Serialize the users
            serializer = UserSerializer(users, many=True)
            # Return the serialized users
            return Response(serializer.data, status=status.HTTP_200_OK)

    # Method for PUT requests
    def put(self, request, user, *args, **kwargs) -> Response:
        try:
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
        except CustomUser.DoesNotExist:
            # Response if the user does not exist
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Methods not allowed

    def post(self, request, *args, **kwargs) -> Response:
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, user_id, *args, **kwargs) -> Response:
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class UserProfileAPIView(APIView):

    # Authentificated users can access this view to change their profile

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        return Response({"error: GET request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request, *args, **kwargs) -> Response:
        FIELDS = ['username', 'email', 'first_name', 'last_name']
        current = {k: v for k, v in request.user.__dict__.items() if k in FIELDS}
        input = request.data
        if all(value is None for value in input.values()):
            return Response({"error": "No data provided."}, status=status.HTTP_400_BAD_REQUEST)
        # Check if the input data is different from the current data
        # Retrieve what's only need to be updated
        new = set(input.items()) - set(current.items())
        if(bool(len(new))):
            try:
                validated_input = UserProfileSerializer(data=dict(new))
                validated_input.is_valid(raise_exception=True)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            # From this point, the request is valid
            # Update the user profile
            serializer = UserSerializer(instance=request.user,data=validated_input.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": serializer.data}, status=status.HTTP_200_OK)
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "No new data provided."}, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, *args, **kwargs) -> Response:
        return Response({"error: DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def post(self, request, *args, **kwargs) -> Response:
        return Response({"error: POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)