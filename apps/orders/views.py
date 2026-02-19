from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from apps.cart.models import Cart
from .serializers import OrderSerializer, OrderDetailSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet для заказов"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Создание заказа из корзины"""
        cart = Cart.objects.get(user=request.user)
        
        if not cart.items.exists():
            return Response(
                {'error': 'Корзина пуста'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = Order.objects.create(user=request.user)
        
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                price=item.product.price,
                quantity=item.quantity
            )
        
        # Очищаем корзину
        cart.items.all().delete()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)