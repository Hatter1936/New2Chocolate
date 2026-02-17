from rest_framework import serializers
from .models import Cart, CartItem
from apps.catalog.models import Product
from apps.catalog.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор для элемента корзины
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    """
    Сериализатор для корзины
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'total_items']