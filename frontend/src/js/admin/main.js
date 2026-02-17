// Глобальный объект для админ-панели
const Admin = {
    products: [],
    originalData: null,
    
    // Инициализация
    init: async function() {
        await this.loadData();
        this.attachEventListeners();
    },
    
    // Загрузка данных
    loadData: async function() {
        const data = await loadProductsData();
        if (data && data.bouquetsData) {
            this.originalData = data;
            this.products = flattenProducts(data.bouquetsData);
            this.renderTable();
        } else {
            document.getElementById('productsTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        Ошибка загрузки данных
                    </td>
                </tr>
            `;
        }
    },
    
    // Отрисовка таблицы
    renderTable: function() {
        const tbody = document.getElementById('productsTableBody');
        let html = '';
        
        this.products.forEach(product => {
            html += this.createProductRow(product);
        });
        
        tbody.innerHTML = html;
    },
    
    // Создание строки таблицы
    createProductRow: function(product) {
        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" alt="${product.name}">
                </td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price.toLocaleString()} ₽</td>
                <td>${product.categoryName}</td>
                <td>
                    <div class="admin-actions">
                        <button class="edit-btn" title="Редактировать" onclick="Admin.editProduct(${product.id})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="delete-btn" title="Удалить" onclick="Admin.deleteProduct(${product.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },
    
    // Редактирование товара
    editProduct: function(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            Modal.fillForEdit({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.categoryName // Показываем русское название
            });
        }
    },
    
    // Удаление товара
    deleteProduct: function(id) {
        if (confirm('Вы уверены, что хотите удалить эту фигурку?')) {
            // Находим товар
            const product = this.products.find(p => p.id === id);
            
            // Удаляем из плоского списка
            this.products = this.products.filter(p => p.id !== id);
            
            const newBouquetsData = unflattenProducts(this.products);
            
            // Сохраняем
            saveProductsData({ bouquetsData: newBouquetsData });
            
            // Перерисовываем таблицу
            this.renderTable();
            
            Notification.show('Фигурка успешно удалена', 'success');
        }
    },
    
    // Сохранение товара
    saveProduct: function(event) {
        event.preventDefault();
        
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseInt(document.getElementById('productPrice').value);
        const categoryName = document.getElementById('productCategory').value;
        const imageFile = document.getElementById('productImage').files[0];
        
        let categoryKey;
        switch(categoryName) {
            case 'Горький': categoryKey = 'dark'; break;
            case 'Молочный': categoryKey = 'milk'; break;
            case 'Рубиновый': categoryKey = 'ruby'; break;
            case 'Белый': categoryKey = 'white'; break;
            case 'Цветной': categoryKey = 'color'; break;
            default: categoryKey = 'milk';
        }
        
        let imageUrl;
        if (imageFile) {
            // В реальном проекте здесь была бы загрузка на сервер
            imageUrl = URL.createObjectURL(imageFile);
        } else {
            imageUrl = `https://via.placeholder.com/100x80/5d4037/ffffff?text=${encodeURIComponent(name.substring(0, 10))}`;
        }
        
        if (id) {
            const productIndex = this.products.findIndex(p => p.id === parseInt(id));
            if (productIndex !== -1) {
                this.products[productIndex] = {
                    ...this.products[productIndex],
                    name: name,
                    description: description,
                    price: price,
                    categoryKey: categoryKey,
                    categoryName: categoryName,
                    image: imageUrl
                };
                
                Notification.show('Фигурка успешно обновлена', 'success');
            }
        } else {
            // Добавление нового товара
            const nextId = Math.max(...this.products.map(p => p.id), 0) + 1;
            
            const newProduct = {
                id: nextId,
                name: name,
                description: description,
                price: price,
                image: imageUrl,
                rating: 5,
                reviews: 0,
                categoryKey: categoryKey,
                categoryName: categoryName
            };
            
            this.products.push(newProduct);
            Notification.show('Фигурка успешно добавлена', 'success');
        }
        
        const newBouquetsData = unflattenProducts(this.products);
        
        // Сохраняем
        saveProductsData({ bouquetsData: newBouquetsData });
        
        // Перерисовываем таблицу
        this.renderTable();
        
        // Закрываем модальное окно
        Modal.close();
    },
    
    // Закрытие модального окна
    closeModal: function() {
        Modal.close();
    },
    
    // Привязка обработчиков событий
    attachEventListeners: function() {
        // Кнопка добавления
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                Modal.open();
            });
        }
        
        // Форма сохранения
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.saveProduct(e);
            });
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});