from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import EmailValidator, RegexValidator


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['first_name',
                  'last_name',
                  'username',
                  'password',
                  'email',
                  'phone_number']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
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
                                     validators=[UnicodeUsernameValidator()])
    email = serializers.EmailField(required=False,
                                   validators=[EmailValidator()])
    first_name = serializers.CharField(
        required=False,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid first name")])
    last_name = serializers.CharField(
        required=False,
        max_length=150,
        validators=[RegexValidator(regex=r"\b([A-ZÀ-ÿ][-,a-zA-Z. ']+)",
                                   message="Not a valid first name")])
