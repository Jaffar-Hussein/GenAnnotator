from rest_framework import serializers
from .models import CustomUser

class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name','last_name','username', 'password', 'email']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()