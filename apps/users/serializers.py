from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.core.models import User

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Подтверждение пароля')

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'password2', 'first_name', 'last_name', 'phone', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    """Сериализатор для входа"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

    # Убираем validate полностью или делаем очень простым
    def validate(self, attrs):
        return attrs