#!/usr/bin/env python
import os
import sys
import django
import random
from decimal import Decimal

# Добавляем путь к проекту в sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')
django.setup()

from apps.catalog.models import Category, Tag, Product

def create_test_data():
    print("\n🍫 НАЧИНАЕМ ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ...\n")
    
    # === 1. КАТЕГОРИИ ===
    categories_data = [
        {'name': 'Молочный шоколад', 'description': 'Нежный и сливочный молочный шоколад'},
        {'name': 'Горький шоколад', 'description': 'Насыщенный вкус с высоким содержанием какао'},
        {'name': 'Белый шоколад', 'description': 'Сладкий и нежный белый шоколад'},
        {'name': 'Рубиновый шоколад', 'description': 'Уникальный розовый шоколад с ягодным послевкусием'},
        {'name': 'Цветной шоколад', 'description': 'Яркие фигурки из цветного шоколада'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'slug': cat_data['name'].lower().replace(' ', '-'),
                'description': cat_data['description'],
            }
        )
        categories[cat_data['name']] = category
        print(f"✅ Категория: {category.name}")
    
    # === 2. ТЕГИ ===
    tags_data = [
        {'name': 'Хит продаж', 'color': 'danger'},
        {'name': 'Новинка', 'color': 'success'},
        {'name': 'Акция', 'color': 'warning'},
        {'name': 'Подарочный', 'color': 'info'},
        {'name': 'Для детей', 'color': 'primary'},
    ]
    
    tags = {}
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            name=tag_data['name'],
            defaults={
                'slug': tag_data['name'].lower().replace(' ', '-'),
                'color': tag_data['color']
            }
        )
        tags[tag_data['name']] = tag
        print(f"🏷️ Тег: {tag.name}")
    
    # === 3. ТОВАРЫ ===
    products_data = [
        # Молочный шоколад
        {
            'name': 'Мишка Тедди',
            'description': 'Очаровательный медвежонок из молочного шоколада. Ручная работа, детальная проработка мордочки.',
            'price': 450,
            'category': 'Молочный шоколад',
            'tags': ['Хит продаж', 'Для детей'],
        },
        {
            'name': 'Зайка с морковкой',
            'description': 'Милый зайчик, держащий шоколадную морковку.',
            'price': 380,
            'old_price': 450,
            'category': 'Молочный шоколад',
            'tags': ['Новинка', 'Акция'],
        },
        {
            'name': 'Сердечко с розой',
            'description': 'Романтичное сердце с объемной розой.',
            'price': 550,
            'category': 'Молочный шоколад',
            'tags': ['Подарочный', 'Хит продаж'],
        },
        
        # Горький шоколад
        {
            'name': 'Элегантный лев',
            'description': 'Царь зверей из горького шоколада 72%.',
            'price': 650,
            'category': 'Горький шоколад',
            'tags': ['Подарочный'],
        },
        {
            'name': 'Дракон',
            'description': 'Могучий дракон из горького шоколада.',
            'price': 750,
            'category': 'Горький шоколад',
            'tags': ['Хит продаж'],
        },
        
        # Белый шоколад
        {
            'name': 'Единорог',
            'description': 'Волшебный единорог из белого шоколада.',
            'price': 520,
            'category': 'Белый шоколад',
            'tags': ['Новинка', 'Для детей'],
        },
        {
            'name': 'Снеговик',
            'description': 'Новогодний снеговик из белого шоколада.',
            'price': 390,
            'category': 'Белый шоколад',
            'tags': ['Для детей'],
        },
        
        # Рубиновый шоколад
        {
            'name': 'Розовый фламинго',
            'description': 'Изящный фламинго из рубинового шоколада.',
            'price': 580,
            'old_price': 650,
            'category': 'Рубиновый шоколад',
            'tags': ['Акция', 'Новинка', 'Хит продаж'],
        },
        {
            'name': 'Цветок сакуры',
            'description': 'Нежный цветок сакуры из рубинового шоколада.',
            'price': 420,
            'category': 'Рубиновый шоколад',
            'tags': ['Подарочный'],
        },
        
        # Цветной шоколад
        {
            'name': 'Разноцветный пони',
            'description': 'Яркий пони из цветного шоколада.',
            'price': 480,
            'category': 'Цветной шоколад',
            'tags': ['Для детей', 'Новинка'],
        },
        {
            'name': 'Радужный единорог',
            'description': 'Единорог с радужной гривой из цветного шоколада.',
            'price': 620,
            'category': 'Цветной шоколад',
            'tags': ['Для детей', 'Хит продаж'],
        },
    ]
    
    print("\n📦 СОЗДАЕМ ТОВАРЫ:")
    created_count = 0
    updated_count = 0
    
    for prod_data in products_data:
        category = categories[prod_data['category']]
        
        product, created = Product.objects.get_or_create(
            name=prod_data['name'],
            defaults={
                'slug': prod_data['name'].lower().replace(' ', '-'),
                'description': prod_data['description'],
                'short_description': prod_data['description'][:100],
                'price': prod_data['price'],
                'old_price': prod_data.get('old_price'),
                'category': category,
                'weight': 100,
                'in_stock': True,
                'quantity': random.randint(5, 20),
            }
        )
        
        # Добавляем теги
        if 'tags' in prod_data:
            for tag_name in prod_data['tags']:
                if tag_name in tags:
                    product.tags.add(tags[tag_name])
        
        if created:
            created_count += 1
            print(f"  ✅ Создан: {product.name} - {product.price}₽")
        else:
            updated_count += 1
            print(f"  📌 Обновлен: {product.name}")
    
    # === 4. ИТОГИ ===
    print("\n" + "="*50)
    print("📊 ИТОГИ ЗАПОЛНЕНИЯ:")
    print(f"📁 Категорий: {Category.objects.count()}")
    print(f"🏷️ Тегов: {Tag.objects.count()}")
    print(f"🍫 Создано новых товаров: {created_count}")
    print(f"📦 Обновлено товаров: {updated_count}")
    print(f"📦 Всего товаров: {Product.objects.count()}")
    print("="*50)
    
    print("\n✨ База данных успешно заполнена!")
    print("👉 Теперь зайдите в админку: http://127.0.0.1:8000/admin/catalog/product/")

if __name__ == '__main__':
    create_test_data()