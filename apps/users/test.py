from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserModelTest(TestCase):
    """Модульное тестирование модели пользователя"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            username='testuser',
            password='test123',
            role='user'
        )
        
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='admin123',
            role='admin'
        )
    
    def test_create_user(self):
        """Тест создания обычного пользователя"""
        self.assertEqual(self.user.email, 'test@test.com')
        self.assertEqual(self.user.role, 'user')
        self.assertFalse(self.user.is_admin_user)
    
    def test_create_admin(self):
        """Тест создания администратора"""
        self.assertEqual(self.admin.role, 'admin')
        self.assertTrue(self.admin.is_admin_user)
    
    def test_user_str(self):
        """Тест строкового представления"""
        self.assertEqual(str(self.user), 'testuser')


class UserAPITest(APITestCase):
    """Модульное тестирование API пользователей"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='test@test.com',
            username='test',
            password='test123',
            role='user'
        )
    
    def test_register(self):
        """Тест регистрации нового пользователя"""
        data = {
            'email': 'new@test.com',
            'username': 'newuser',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
    
    def test_login(self):
        """Тест входа в систему"""
        data = {'email': 'test@test.com', 'password': 'test123'}
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_wrong_password(self):
        """Тест входа с неверным паролем"""
        data = {'email': 'test@test.com', 'password': 'wrongpass'}
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_profile_access(self):
        """Тест доступа к профилю"""
        # Без токена - ошибка
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # С токеном - успех
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)