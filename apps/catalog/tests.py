from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Category, Product

User = get_user_model()

class CatalogModelTest(TestCase):
    """Модульное тестирование моделей каталога"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name="Тестовая категория",
            slug="test-category"
        )
        
        self.product = Product.objects.create(
            name="Тестовый товар",
            slug="test-product",
            description="Описание тестового товара",
            short_description="Краткое описание",
            price=1000,
            category=self.category,
            weight=100,
            quantity=10
        )
    
    def test_category_creation(self):
        """Тест создания категории"""
        self.assertEqual(self.category.name, "Тестовая категория")
        self.assertEqual(self.category.slug, "test-category")
        self.assertTrue(self.category.is_active)
    
    def test_product_creation(self):
        """Тест создания товара"""
        self.assertEqual(self.product.name, "Тестовый товар")
        self.assertEqual(self.product.price, 1000)
        self.assertEqual(self.product.category, self.category)
        self.assertTrue(self.product.in_stock)
    
    def test_product_str_method(self):
        """Тест строкового представления товара"""
        self.assertEqual(str(self.product), "Тестовый товар")
    
    def test_has_discount_property(self):
        """Тест свойства has_discount"""
        self.assertFalse(self.product.has_discount)
        self.product.old_price = 1200
        self.product.save()
        self.assertTrue(self.product.has_discount)


class CatalogAPITest(APITestCase):
    """Модульное тестирование API каталога"""
    
    def setUp(self):
        self.client = APIClient()
        
        self.category = Category.objects.create(
            name="Тестовая категория",
            slug="test-category"
        )
        
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
    
    def test_get_products_list(self):
        """Тест получения списка товаров"""
        response = self.client.get('/api/catalog/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_get_product_detail(self):
        """Тест получения деталей товара"""
        response = self.client.get(f'/api/catalog/products/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Тестовый товар')
    
    def test_filter_by_category(self):
        """Тест фильтрации по категории"""
        response = self.client.get('/api/catalog/products/?category__slug=test-category')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)