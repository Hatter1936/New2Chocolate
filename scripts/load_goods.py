import sys
import os
import json
import django

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')
django.setup()

from apps.catalog.models import Category, Product, Tag

def load_data():
    """Загрузка данных из goods.json"""
    
    # Путь к JSON файлу
    json_path = os.path.join('frontend', 'src', 'goods.json')
    
    if not os.path.exists(json_path):
        print(f"❌ Файл не найден: {json_path}")
        return
    
    print(f"✅ Найден файл: {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Создаём тег "Хит" для товаров со скидкой
    hit_tag, _ = Tag.objects.get_or_create(
        name='Хит',
        defaults={'slug': 'hit', 'color': 'danger'}
    )
    
    # Проходим по всем категориям букетов
    for bouquet_category in data['bouquetsData']:
        # В каждом объекте есть ключ типа "dark", "ruby", "milk" и т.д.
        for category_key, category_data in bouquet_category.items():
            print(f"\n📁 Обработка категории: {category_data['title']}")
            
            # Создаём категорию в БД
            category, created = Category.objects.get_or_create(
                name=category_data['title'],
                defaults={
                    'slug': category_key,
                    'description': category_data.get('description', ''),
                    'is_active': True
                }
            )
            
            if created:
                print(f"  ✅ Создана категория: {category.name}")
            else:
                print(f"  ⚠️ Категория уже существует: {category.name}")
            
            # Создаём товары в этой категории
            for product_data in category_data['products']:
                # Определяем, есть ли скидка
                old_price = product_data.get('oldPrice')
                if old_price:
                    price = old_price  # В JSON oldPrice - это старая цена, а price - новая?
                    # На самом деле нужно уточнить структуру
                
                # Создаём товар
                product, created = Product.objects.get_or_create(
                    name=product_data['name'],
                    defaults={
                        'slug': product_data['name'].lower().replace(' ', '-'),
                        'description': product_data.get('description', ''),
                        'short_description': product_data.get('description', '')[:100],
                        'price': product_data.get('price', 0),
                        'old_price': product_data.get('oldPrice', None),
                        'category': category,
                        'weight': 100,  # Значение по умолчанию для шоколада
                        'in_stock': True,
                        'quantity': 10
                    }
                )
                
                if created:
                    print(f"    ✅ Товар: {product.name} - {product.price}₽")
                    
                    # Если есть старая цена (скидка), добавляем тег "Хит"
                    if product_data.get('oldPrice'):
                        product.tags.add(hit_tag)
                else:
                    print(f"    ⚠️ Товар уже существует: {product.name}")
    
    print("\n🎉 Загрузка завершена!")

def show_stats():
    """Показать статистику"""
    print("\n📊 Статистика:")
    print(f"Категорий: {Category.objects.count()}")
    print(f"Товаров: {Product.objects.count()}")
    print(f"Тегов: {Tag.objects.count()}")

if __name__ == '__main__':
    print("🚀 Загрузка данных из goods.json...")
    print("=" * 50)
    load_data()
    show_stats()