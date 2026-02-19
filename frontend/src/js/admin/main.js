// Глобальный объект для админ-панели
const Admin = {
    products: [],
    
    // Инициализация
    init: async function() {
        console.log('Админка инициализируется...');
        
        // Проверяем токен
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = 'login.html?redirect=admin.html';
            return;
        }
        
        await this.loadProducts();
        this.attachEventListeners();
    },
    
    // Загрузка товаров
    loadProducts: async function() {
        const products = await AdminAPI.getProducts();
        if (products && products.length > 0) {
            this.products = products;
            this.renderTable();
        } else {
            document.getElementById('productsTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-info-circle"></i>
                        Нет товаров. Добавьте первый товар!
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
        // Получаем название категории
        let categoryName = 'Молочный';
        const categoryId = product.category ? (product.category.id || product.category) : 1;
        
        const categoryMap = {
            1: 'Молочный',
            2: 'Горький',
            3: 'Белый',
            4: 'Рубиновый',
            5: 'Цветной'
        };
        
        categoryName = categoryMap[categoryId] || 'Молочный';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.main_image || 'https://via.placeholder.com/80'}" 
                        alt="${product.name}"
                        style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;"
                        onerror="this.src='https://via.placeholder.com/80'">
                </td>
                <td>${product.name}</td>
                <td>${(product.description || '').substring(0, 100)}...</td>
                <td>${Number(product.price).toLocaleString()} ₽</td>
                <td>${categoryName}</td>
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
            // Получаем название категории
            let categoryName = 'Молочный';
            const categoryId = product.category ? (product.category.id || product.category) : 1;
            
            const categoryMap = {
                1: 'Молочный',
                2: 'Горький',
                3: 'Белый',
                4: 'Рубиновый',
                5: 'Цветной'
            };
            
            categoryName = categoryMap[categoryId] || 'Молочный';
            
            Modal.fillForEdit({
                id: product.id,
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: categoryName
            });
        }
    },
    
    // Удаление товара
    deleteProduct: async function(id) {
        if (confirm('Вы уверены, что хотите удалить эту фигурку?')) {
            const success = await AdminAPI.deleteProduct(id);
            if (success) {
                this.products = this.products.filter(p => p.id !== id);
                this.renderTable();
                alert('Товар успешно удален!');
                
                // Обновляем каталог
                if (window.catalogLoader) {
                    window.catalogLoader.clearCache();
                }
                localStorage.removeItem('catalog_products');
            } else {
                alert('Ошибка при удалении');
            }
        }
    },
    
    // Сохранение товара
    saveProduct: async function(event) {
        event.preventDefault();
        
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseInt(document.getElementById('productPrice').value);
        const categoryName = document.getElementById('productCategory').value;
        const imageFile = document.getElementById('productImage').files[0];
        
        if (!name || !description || !price || !categoryName) {
            alert('Заполните все поля!');
            return;
        }
        
        const productData = {
            name: name,
            description: description,
            price: price,
            category: categoryName,
            weight: 100,
            quantity: 10
        };
        
        if (imageFile) {
            productData.image = imageFile;
        }
        
        let result;
        if (id) {
            result = await AdminAPI.updateProduct(parseInt(id), productData);
        } else {
            result = await AdminAPI.createProduct(productData);
        }
        
        if (result) {
            await this.loadProducts();
            Modal.close();
            alert(id ? 'Товар обновлен!' : 'Товар создан!');
            
            // Обновляем каталог
            if (window.catalogLoader) {
                window.catalogLoader.clearCache();
            }
            localStorage.removeItem('catalog_products');
        }
    },
    
    // Закрытие модального окна
    closeModal: function() {
        Modal.close();
    },
    
    // Привязка обработчиков
    attachEventListeners: function() {
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                Modal.open();
            });
        }
        
        const form = document.getElementById('productForm');
        if (form) {
            form.removeEventListener('submit', this.saveProduct.bind(this));
            form.addEventListener('submit', (e) => this.saveProduct(e));
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});