from rest_framework import serializers
from apps.catalog.models import Product, Category

class AdminProductSerializer(serializers.ModelSerializer):
    """
    Сериализатор для товаров в админке
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'old_price', 'main_image', 'category', 'category_name',
            'weight', 'in_stock', 'quantity', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']