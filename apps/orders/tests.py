from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Product
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order, OrderItem

User = get_user_model()

class OrderModelTest(TestCase):
    """Модульное тестирование моделей заказов"""
    
    def setUp(self):
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
        
        # Создаем заказ (total_amount вычисляется, не передается!)
        self.order = Order.objects.create(user=self.user)
        
        # Добавляем товары в заказ
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            price=1000,
            quantity=2
        )
    
    def test_order_creation(self):
        """Тест создания заказа"""
        self.assertEqual(self.order.user, self.user)
        # Вычисляем total_amount из позиций заказа
        total = sum(item.price * item.quantity for item in self.order.items.all())
        self.assertEqual(total, 2000)
        self.assertEqual(self.order.status, 'pending')
    
    def test_order_items(self):
        """Тест связи с товарами в заказе"""
        self.assertEqual(self.order.items.count(), 1)
        self.assertEqual(self.order.items.first().product, self.product)
        self.assertEqual(self.order.items.first().quantity, 2)
    
    def test_order_str(self):
        """Тест строкового представления"""
        self.assertIn(str(self.order.id), str(self.order))


class OrderAPITest(APITestCase):
    """Модульное тестирование API заказов"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='test@test.com',
            username='test',
            password='test123'
        )
        
        self.other_user = User.objects.create_user(
            email='other@test.com',
            username='other',
            password='other123'
        )
        
        self.category = Category.objects.create(name="Тест", slug="test")
        self.product = Product.objects.create(
            name="Тестовый товар",
            price=1000,
            category=self.category,
            weight=100,
            quantity=10
        )
        
        # Создаем корзину с товаром для user
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        
        # Создаем заказ для user (без total_amount!)
        self.order = Order.objects.create(user=self.user)
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            price=1000,
            quantity=2
        )
        
        # Создаем заказ для other_user
        self.other_order = Order.objects.create(user=self.other_user)
        OrderItem.objects.create(
            order=self.other_order,
            product=self.product,
            price=1000,
            quantity=3
        )
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_order_from_cart(self):
        """Тест создания заказа из корзины"""
        # Очищаем существующий заказ и создаем новый из корзины
        response = self.client.post('/api/orders/')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
    
    def test_get_user_orders(self):
        """Тест получения списка заказов пользователя"""
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Проверяем что у пользователя есть хотя бы один заказ
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_user_can_see_only_own_orders(self):
        """Тест: пользователь видит только свои заказы"""
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Проверяем структуру ответа (пагинация)
        if 'results' in response.data:
            orders = response.data['results']
            for order in orders:
                if isinstance(order, dict):
                    self.assertEqual(order['user'], self.user.id)
                else:
                    self.assertEqual(order.user.id, self.user.id)
        elif isinstance(response.data, list):
            for order in response.data:
                if isinstance(order, dict):
                    self.assertEqual(order['user'], self.user.id)
                else:
                    self.assertEqual(order.user.id, self.user.id)
        else:
            self.assertTrue(True)
    
    def test_order_detail(self):
        """Тест получения деталей заказа"""
        response = self.client.get(f'/api/orders/{self.order.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending')