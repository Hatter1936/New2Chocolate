import sys
import os
import json
import random
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')
django.setup()

from apps.catalog.models import Product, Category, Tag

def convert_to_chocolate():
    """Конвертирует данные цветов в шоколадные фигурки"""
    
    # Создаём теги для шоколада
    tags = {
        'hit': Tag.objects.get_or_create(name='Хит', defaults={'slug': 'hit', 'color': 'danger'})[0],
        'new': Tag.objects.get_or_create(name='Новинка', defaults={'slug': 'new', 'color': 'success'})[0],
        'gift': Tag.objects.get_or_create(name='Подарок', defaults={'slug': 'gift', 'color': 'warning'})[0],
    }
    
    # Шоколадные названия для замены цветочных
    chocolate_names = [
        "Шоколадный мишка",
        "Шоколадный зайка", 
        "Шоколадное сердечко",
        "Шоколадная роза",
        "Шоколадный автомобиль",
        "Шоколадный домик",
        "Шоколадный ёжик",
        "Шоколадная коробка",
        "Шоколадная открытка",
        "Шоколадный букет"
    ]
    
    # Обновляем все товары
    products = Product.objects.all()
    print(f"Найдено товаров для конвертации: {products.count()}")
    
    for i, product in enumerate(products):
        # Меняем название на шоколадное
        if i < len(chocolate_names):
            product.name = chocolate_names[i]
        else:
            product.name = f"Шоколадная фигурка #{i+1}"
        
        # Меняем описание
        product.description = f"Изысканная шоколадная фигурка ручной работы. {product.description}"
        product.short_description = product.description[:100]
        
        # Корректируем цену для шоколада (обычно дешевле цветов)
        product.price = product.price / 10  # Уменьшаем цену в 10 раз
        if product.old_price:
            product.old_price = product.old_price / 10
        
        # Обновляем slug
        product.slug = product.name.lower().replace(' ', '-')
        
        # Добавляем случайные теги
        if product.price > 500:
            product.tags.add(tags['hit'])
        if random.choice([True, False]):
            product.tags.add(tags['new'])
        
        product.save()
        print(f"✅ Обновлён: {product.name} - {product.price}₽")

if __name__ == '__main__':
    print("🍫 Конвертация цветов в шоколад...")
    convert_to_chocolate()