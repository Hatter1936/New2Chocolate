import os
from PIL import Image
import io

def create_default_image():
    """Создает заглушку для изображений"""
    # Путь к папке
    media_path = 'E:/Chocolate/media/products'
    os.makedirs(media_path, exist_ok=True)
    
    # Создаем простое изображение
    img = Image.new('RGB', (800, 800), color='#5d4037')
    
    # Сохраняем
    img.save(os.path.join(media_path, 'default.jpg'))
    print(f"Создано изображение-заглушка: {media_path}/default.jpg")

if __name__ == '__main__':
    create_default_image()