from django.db import models
from apps.core.models import BaseModel
from django.utils.text import slugify

class Category(BaseModel):
    """
    Категории товаров
    """
    name = models.CharField(max_length=100, verbose_name='Название')
    slug = models.SlugField(max_length=120, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Описание')
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name='Изображение')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='children', verbose_name='Родительская категория')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортировки')
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(BaseModel):
    """
    Теги для товаров (например, "Хит продаж", "Новинка")
    """
    name = models.CharField(max_length=50, verbose_name='Название')
    slug = models.SlugField(max_length=60, unique=True, verbose_name='URL')
    color = models.CharField(max_length=20, default='primary', verbose_name='Цвет (CSS класс)')
    
    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'
    
    def __str__(self):
        return self.name


class Product(BaseModel):
    """
    Товары (шоколадные фигурки)
    """
    name = models.CharField(max_length=200, verbose_name='Название')
    slug = models.SlugField(max_length=220, unique=True, verbose_name='URL')
    description = models.TextField(verbose_name='Описание')
    short_description = models.CharField(max_length=300, verbose_name='Краткое описание')
    
    # Цены
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, 
                                    verbose_name='Старая цена')
    
    # Изображения
    main_image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name='Главное изображение')
    
    # Связи
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', 
                                 verbose_name='Категория')
    tags = models.ManyToManyField(Tag, blank=True, related_name='products', verbose_name='Теги')
    
    # Характеристики
    weight = models.PositiveIntegerField(help_text='Вес в граммах', verbose_name='Вес')
    in_stock = models.BooleanField(default=True, verbose_name='В наличии')
    quantity = models.PositiveIntegerField(default=0, verbose_name='Количество на складе')
    
    # Статистика
    views_count = models.PositiveIntegerField(default=0, verbose_name='Просмотры')
    orders_count = models.PositiveIntegerField(default=0, verbose_name='Заказов')
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True, verbose_name='Meta Title')
    meta_description = models.TextField(blank=True, verbose_name='Meta Description')
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def has_discount(self):
        return self.old_price and self.old_price > self.price


class ProductImage(models.Model):
    """
    Дополнительные изображения товара
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', 
                                verbose_name='Товар')
    image = models.ImageField(upload_to='products/gallery/', verbose_name='Изображение')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    
    class Meta:
        verbose_name = 'Изображение товара'
        verbose_name_plural = 'Изображения товаров'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.name} - изображение {self.order}"