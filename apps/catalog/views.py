from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для категорий (только чтение)
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """
        Получить все товары в категории
        """
        category = self.get_object()
        products = Product.objects.filter(
            category=category, 
            is_active=True
        ).select_related('category').prefetch_related('tags')
        
        tag = request.query_params.get('tag')
        if tag:
            products = products.filter(tags__slug=tag)
        
        ordering = request.query_params.get('ordering', '-created_at')
        products = products.order_by(ordering)
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для товаров (только чтение для пользователей)
    """
    queryset = Product.objects.all().select_related(
        'category'
    ).prefetch_related('tags', 'images')
    
    serializer_class = ProductListSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug', 'in_stock']
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['price', 'created_at', 'views_count', 'orders_count']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        Увеличиваем счетчик просмотров при просмотре товара
        """
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Получить популярные товары (по просмотрам или заказам)
        """
        products = self.get_queryset().order_by('-views_count')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def new(self, request):
        """
        Получить новинки
        """
        products = self.get_queryset().order_by('-created_at')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def discounted(self, request):
        """
        Получить товары со скидкой
        """
        products = self.get_queryset().filter(old_price__isnull=False)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)