from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import EmailValidator, RegexValidator
from rest_framework.validators import UniqueValidator


class SignUpSerializer(serializers.ModelSerializer):
    """ Serializer to create a new user """
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True, 
                                   validators=[EmailValidator(), UniqueValidator(queryset=CustomUser.objects.all(), lookup='iexact')])
    username = serializers.CharField(required=True, 
                                     validators=[UnicodeUsernameValidator(), UniqueValidator(queryset=CustomUser.objects.all(), lookup='iexact')])
    first_name = serializers.CharField(
        required=True,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid first name")])
    last_name = serializers.CharField(
        required=True,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid last name")])
    class Meta:
        model = CustomUser
        fields = ['first_name',
                  'last_name',
                  'username',
                  'password',
                  'email',
                  'phone_number']


class LoginSerializer(serializers.Serializer):
    """ Serializer to login a user """
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, max_length=128, write_only=True)


class UserSerializer(serializers.ModelSerializer):
    """ Serializer to display user information """
    class Meta:
        model = CustomUser
        fields = ['username',
                  'first_name',
                  'last_name',
                  'email',
                  'role']


class UserProfileSerializer(serializers.Serializer):
    """ Serializer to update user profile """

    username = serializers.CharField(required=False,
                                     max_length=150,
                                     validators=[UnicodeUsernameValidator(), UniqueValidator(queryset=CustomUser.objects.all(), lookup='iexact')])
    email = serializers.EmailField(required=False,
                                   validators=[EmailValidator(), UniqueValidator(queryset=CustomUser.objects.all(), lookup='iexact')])
    first_name = serializers.CharField(
        required=False,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid first name")])
    last_name = serializers.CharField(
        required=False,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid last name")])
