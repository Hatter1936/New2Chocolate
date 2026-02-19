from rest_framework import serializers
from .models import Order, OrderItem
from apps.catalog.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_amount', 'status', 'created_at']
    
    def get_total_amount(self, obj):
        return sum(item.price * item.quantity for item in obj.items.all())

class OrderDetailSerializer(OrderSerializer):
    """Детальный сериализатор заказа"""
    pass