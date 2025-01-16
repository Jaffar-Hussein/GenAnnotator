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
    def post(self, request, *args, **kwargs):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = CustomUser(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                phone_number=serializer.validated_data['phone_number'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
            )
            user.set_password(serializer.validated_data['password'])
            user.save()
            send_email_confirmation(request, user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginAPIView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
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
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, *args, **kwargs):
        return Response({"error": "GET request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def put(self, request, *args, **kwargs):
        return Response({"error": "PUT request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, *args, **kwargs):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
class UserAPIView(APIView):

    permission_classes = [IsAuthenticated|IsAdminUser]

    def get(self, request, *args, **kwargs):
        users = CustomUser.objects.all()
        paginator = LimitOffsetPagination()
        users = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(users, many=True)
        return paginator.get_paginated_response(serializer.data)

    def put(self, request, user, *args, **kwargs):
        user = CustomUser.objects.get(username=user)
        new_role = request.data.get('role',None)
        if new_role:
            if user.setrole(new_role):
                return Response({"success": f"Role updated to {new_role}."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": f"Invalid role provided {new_role}."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Role not provided."}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        return Response({"error": "POST request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def delete(self, request, user_id, *args, **kwargs):
        return Response({"error": "DELETE request not supported."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)