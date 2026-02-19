from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Product
from apps.cart.models import Cart, CartItem

User = get_user_model()

class CartModelTest(TestCase):
    """Модульное тестирование моделей корзины"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            username='test',
            password='test123'
        )
        
        self.category = Category.objects.create(name="Тест", slug="test")
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
        
        self.cart = Cart.objects.create(user=self.user)
    
    def test_add_to_cart(self):
        """Тест добавления товара в корзину"""
        item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        self.assertEqual(self.cart.items.count(), 1)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.total_price, 2000)
    
    def test_cart_total(self):
        """Тест подсчета общей суммы"""
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        self.assertEqual(self.cart.total_price, 2000)


class CartAPITest(APITestCase):
    """Модульное тестирование API корзины"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='test@test.com',
            username='test',
            password='test123'
        )
        
        self.category = Category.objects.create(name="Тест", slug="test")
        self.product = Product.objects.create(
            name="Тестовый товар",
            price=1000,
            category=self.category,
            weight=100,
            quantity=10
        )
        
        # Авторизуем пользователя
        self.client.force_authenticate(user=self.user)
    
    def test_get_cart(self):
        """Тест получения корзины"""
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_add_to_cart(self):
        """Тест добавления в корзину через API"""
        data = {'product_id': self.product.id, 'quantity': 2}
        response = self.client.post('/api/cart/add_item/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'][0]['quantity'], 2)
    
    def test_clear_cart(self):
        """Тест очистки корзины"""
        # Сначала добавляем товар
        self.client.post('/api/cart/add_item/', {'product_id': self.product.id})
        # Потом очищаем
        response = self.client.post('/api/cart/clear/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)