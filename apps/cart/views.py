from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.catalog.models import Product

class CartViewSet(viewsets.GenericViewSet):
    """
    ViewSet для работы с корзиной
    """
    serializer_class = CartSerializer
    
    def get_permissions(self):
        if self.action in ['add_item', 'update_item', 'remove_item', 'clear']:
            return [AllowAny()]  # Для анонимных пользователей (по сессии)
        return [AllowAny()]
    
    def get_cart(self, request):
        """
        Получить или создать корзину для текущего пользователя/сессии
        """
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.save()
                session_key = request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        
        return cart
    
    def list(self, request):
        """
        Получить содержимое корзины
        """
        cart = self.get_cart(request)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Добавить товар в корзину
        """
        cart = self.get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not product.in_stock:
            return Response(
                {"error": "Товара нет в наличии"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if product.quantity < quantity:
            return Response(
                {"error": f"Доступно только {product.quantity} шт."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """
        Обновить количество товара
        """
        cart = self.get_cart(request)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        
        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """
        Удалить товар из корзины
        """
        cart = self.get_cart(request)
        item_id = request.data.get('item_id')
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """
        Очистить корзину
        """
        cart = self.get_cart(request)
        cart.items.all().delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)