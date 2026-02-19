// API для работы с бэкендом
const AdminAPI = {
    baseURL: 'http://127.0.0.1:8000/api/admin',
    
    // Получение токена
    getToken() {
        return localStorage.getItem('access_token');
    },
    
    // Получение всех товаров
    async getProducts() {
        try {
            console.log('Загружаем товары админки...');
            const token = this.getToken();
            
            if (!token) {
                window.location.href = 'login.html?redirect=admin.html';
                return [];
            }
            
            const response = await fetch(`${this.baseURL}/products/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                alert('У вас нет прав администратора');
                window.location.href = 'index.html';
                return [];
            }
            
            if (!response.ok) {
                throw new Error('Ошибка загрузки');
            }
            
            const data = await response.json();
            console.log('Товары из БД:', data);
            
            const products = data.results || data || [];
            
            return products;
        } catch (error) {
            console.error('Ошибка:', error);
            return [];
        }
    },
    
    // Создание товара
    async createProduct(productData) {
        try {
            const token = this.getToken();
            if (!token) {
                window.location.href = 'login.html?redirect=admin.html';
                return null;
            }
            
            const formData = new FormData();
            
            // Обязательные поля
            formData.append('name', productData.name);
            formData.append('description', productData.description || '');
            formData.append('short_description', productData.description?.substring(0, 100) || '');
            formData.append('price', productData.price);
            formData.append('weight', productData.weight || 100);
            formData.append('quantity', productData.quantity || 10);
            formData.append('in_stock', true);
            formData.append('is_active', true);
            
            // Категория - исправленные ID!
            const categoryMap = {
                'Молочный': 1,
                'Горький': 2,
                'Белый': 3,
                'Рубиновый': 4,
                'Цветной': 5
            };
            
            const categoryId = categoryMap[productData.category] || 1;
            formData.append('category', categoryId);
            
            // Изображение (если есть)
            if (productData.image && productData.image instanceof File) {
                formData.append('main_image', productData.image);
            }
            
            const response = await fetch(`${this.baseURL}/products/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('Ошибка создания:', error);
                alert('Ошибка: ' + JSON.stringify(error));
                return null;
            }
            
            const data = await response.json();
            
            // Очищаем кеш каталога
            localStorage.removeItem('catalog_products');
            
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    },
    
    // Обновление товара
    async updateProduct(id, productData) {
        try {
            const token = this.getToken();
            if (!token) {
                window.location.href = 'login.html?redirect=admin.html';
                return null;
            }
            
            const formData = new FormData();
            
            formData.append('name', productData.name);
            formData.append('description', productData.description || '');
            formData.append('short_description', productData.description?.substring(0, 100) || '');
            formData.append('price', productData.price);
            formData.append('weight', productData.weight || 100);
            formData.append('quantity', productData.quantity || 10);
            
            const categoryMap = {
                'Молочный': 1,
                'Горький': 2,
                'Белый': 3,
                'Рубиновый': 4,
                'Цветной': 5
            };
            
            const categoryId = categoryMap[productData.category] || 1;
            formData.append('category', categoryId);
            
            if (productData.image && productData.image instanceof File) {
                formData.append('main_image', productData.image);
            }
            
            const response = await fetch(`${this.baseURL}/products/${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('Ошибка обновления:', error);
                alert('Ошибка: ' + JSON.stringify(error));
                return null;
            }
            
            const data = await response.json();
            
            localStorage.removeItem('catalog_products');
            
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    },
    
    // Удаление товара
    async deleteProduct(id) {
        try {
            const token = this.getToken();
            if (!token) {
                window.location.href = 'login.html?redirect=admin.html';
                return false;
            }
            
            console.log('Удаляем товар ID:', id);
            
            const response = await fetch(`${this.baseURL}/products/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Статус удаления:', response.status);
            
            if (response.ok) {
                // Очищаем кеш
                localStorage.removeItem('catalog_products');
                localStorage.removeItem('catalog_timestamp');
                
                // Отправляем событие обновления
                window.dispatchEvent(new CustomEvent('catalog-update'));
                
                return true;
            } else {
                const error = await response.json();
                console.error('Ошибка удаления:', error);
                alert('Ошибка удаления: ' + JSON.stringify(error));
                return false;
            }
        } catch (error) {
            console.error('Ошибка:', error);
            return false;
        }
    }
};