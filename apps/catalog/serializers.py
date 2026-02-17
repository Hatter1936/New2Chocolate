from rest_framework import serializers
from .models import Category, Tag, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    """
    Сериализатор для категорий
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'order']


class TagSerializer(serializers.ModelSerializer):
    """
    Сериализатор для тегов
    """
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'color']


class ProductImageSerializer(serializers.ModelSerializer):
    """
    Сериализатор для изображений товара
    """
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка товаров (краткая информация)
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'price', 'old_price',
            'main_image', 'category_name', 'tags', 'in_stock', 'has_discount'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Сериализатор для детальной страницы товара
    """
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'old_price', 'main_image', 'images', 'category',
            'tags', 'weight', 'in_stock', 'quantity', 'has_discount'
        ]
        def get_images(self, obj):
            return [img.image.url for img in obj.images.all()]