from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Product
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class AdminPanelAPITest(APITestCase):
    """Модульное тестирование админ-панели"""
    
    def setUp(self):
        # Создаем админа
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='admin123',
            role='admin'
        )
        self.admin.is_staff = True
        self.admin.save()
        
        # Создаем обычного пользователя
        self.user = User.objects.create_user(
            email='user@test.com',
            username='user',
            password='user123',
            role='user'
        )
        
        # Создаем категорию
        self.category = Category.objects.create(
            name="Тестовая категория",
            slug="test-category"
        )
        
        # Создаем товар
        self.product = Product.objects.create(
            name="Тестовый товар",
            slug="test-product",
            description="Описание",
            short_description="Кратко",
            price=1000,
            category=self.category,
            weight=100,
            quantity=10
        )
        
        self.client = APIClient()
    
    def test_admin_can_create_product(self):
        """Тест: админ может создать товар"""
        self.client.force_authenticate(user=self.admin)
        
        data = {
            'name': 'Новый товар',
            'description': 'Описание нового товара',
            'short_description': 'Краткое описание',
            'price': 1500,
            'category': self.category.id,
            'weight': 200,
            'quantity': 5,
            'in_stock': True,
            'is_active': True,
        }
        
        response = self.client.post('/api/admin/products/', data, format='json')
        print('Ответ сервера:', response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
    
    def test_user_cannot_create_product(self):
        """Тест: обычный пользователь НЕ может создать товар"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'Новый товар',
            'description': 'Описание',
            'short_description': 'Кратко',
            'price': 1500,
            'category': self.category.id,
            'weight': 200,
            'quantity': 5,
        }
        
        response = self.client.post('/api/admin/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_delete_product(self):
        """Тест: админ может удалить товар"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.delete(f'/api/admin/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)
    
    def test_unauthorized_cannot_access(self):
        """Тест: неавторизованный пользователь не имеет доступа"""
        response = self.client.get('/api/admin/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)