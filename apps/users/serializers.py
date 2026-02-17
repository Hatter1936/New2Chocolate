from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import User

class RegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации
    """
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Сериализатор для входа
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Пользователь заблокирован")
                data['user'] = user
            else:
                raise serializers.ValidationError("Неверный логин или пароль")
        else:
            raise serializers.ValidationError("Необходимо указать логин и пароль")
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для данных пользователя
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role']


class TokenResponseSerializer(serializers.Serializer):
    """
    Сериализатор для ответа с токенами
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()