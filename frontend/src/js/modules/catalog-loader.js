// Кеш и синхронизация
window.catalogLoader = {
    clearCache: function() {
        cachedProducts = null;
        isLoading = false;
        lastLoadTime = 0;
        localStorage.removeItem('catalog_products');
        localStorage.removeItem('catalog_timestamp');
        console.log('Кеш каталога очищен');
    }
};

// Слушаем события обновления каталога из админки
window.addEventListener('catalog-update', function() {
    console.log('Получено событие обновления каталога');
    cachedProducts = null;
    localStorage.removeItem('catalog_products');
    localStorage.removeItem('catalog_timestamp');
    
    // Если мы на странице каталога - перезагружаем товары
    if (window.location.pathname.includes('catalog.html') || 
        window.location.pathname.includes('category.html')) {
        displayAllProducts();
    }
});

// Переменные для кеширования
let isLoading = false;
let lastLoadTime = 0;
const MIN_LOAD_INTERVAL = 2000;
let cachedProducts = null;

// Загрузка данных с сервера
async function loadBouquetsData(forceRefresh = false) {
    forceRefresh = true;

    const now = Date.now();
    
    // Защита от слишком частых вызовов
    if (!forceRefresh && isLoading) {
        console.log('Загрузка уже выполняется, пропускаем');
        return null;
    }
    
    // Проверяем кеш в памяти
    if (!forceRefresh && cachedProducts) {
        console.log('Используем кешированные данные в памяти');
        return cachedProducts;
    }
    
    // Проверяем кеш в localStorage
    if (!forceRefresh) {
        const storedProducts = localStorage.getItem('catalog_products');
        const storedTimestamp = localStorage.getItem('catalog_timestamp');
        
        if (storedProducts && storedTimestamp) {
            const age = now - parseInt(storedTimestamp);
            if (age < 60000) {
                console.log('Используем кешированные данные из localStorage');
                cachedProducts = JSON.parse(storedProducts);
                return cachedProducts;
            }
        }
    }
    
    if (!forceRefresh && (now - lastLoadTime < MIN_LOAD_INTERVAL)) {
        console.log('Слишком частые запросы, пропускаем');
        return null;
    }
    
    isLoading = true;
    lastLoadTime = now;
    
    try {
        const API_URL = 'http://127.0.0.1:8000/api/catalog/products/';
        console.log('Загружаем товары с сервера:', API_URL);
        
        const response = await fetch(API_URL);
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные от API:', data);
        
        const products = data.results || data; 
        console.log('Товаров получено:', products.length);
        
        // Группируем товары по категориям
        const bouquetsData = [];
        const categories = {};
        
        products.forEach(product => {
            const categoryName = product.category_name || 'Другое';
            if (!categories[categoryName]) {
                categories[categoryName] = {
                    title: categoryName,
                    description: `Шоколадные фигурки в категории ${categoryName}`,
                    products: []
                };
            }
            categories[categoryName].products.push({
                id: product.id,
                name: product.name,
                description: product.short_description || product.description,
                price: product.price,
                oldPrice: product.old_price,
                image: product.main_image || 'https://via.placeholder.com/300',
                rating: 5,
                reviews: 0
            });
        });
        
        const result = Object.values(categories);
        console.log('Итоговые данные для отображения:', result);
        
        // Сохраняем в кеш
        cachedProducts = result;
        localStorage.setItem('catalog_products', JSON.stringify(result));
        localStorage.setItem('catalog_timestamp', now.toString());
        
        return result;
        
    } catch (error) {
        console.error('Ошибка в loadBouquetsData:', error);
        return null;
    } finally {
        isLoading = false;
    }
}

// Функция для создания звездного рейтинга
function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Функция для отображения всех товаров
async function displayAllProducts() {
    console.log('Отображение всех товаров');
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
        console.log('Контейнер products-container не найден');
        return;
    }
    
    productsContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    const bouquetsData = await loadBouquetsData();
    
    if (!bouquetsData || !Array.isArray(bouquetsData)) {
        productsContainer.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
        return;
    }
    
    // Собираем все товары из всех категорий
    let allProducts = [];
    
    bouquetsData.forEach((category, index) => {
        if (!category || typeof category !== 'object' || !category.products) {
            return;
        }
        
        const categoryTitle = category.title || 'Без названия';
        const categoryProducts = category.products;
        
        if (Array.isArray(categoryProducts)) {
            categoryProducts.forEach(product => {
                allProducts.push({
                    ...product,
                    category: categoryTitle.toLowerCase().replace(/ /g, '-'),
                    categoryTitle: categoryTitle
                });
            });
        }
    });
    
    console.log(`Всего товаров для отображения: ${allProducts.length}`);
    
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }
    
    displayProducts(allProducts, productsContainer);
}

// Функция для отображения товаров конкретной категории
async function displayCategoryProducts(categoryId) {
    console.log(`Отображение категории: ${categoryId}`);
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    const bouquetsData = await loadBouquetsData();
    
    if (!bouquetsData) {
        productsContainer.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
        return;
    }
    
    // Маппинг ID категорий из URL в названия
    const categoryMap = {
        'dark': 'Горький шоколад',
        'milk': 'Молочный шоколад',
        'ruby': 'Рубиновый шоколад',
        'white': 'Белый шоколад',
        'color': 'Цветной шоколад',
        'all': 'Все'
    };
    
    const targetCategory = categoryMap[categoryId];
    console.log('Ищем категорию:', targetCategory);
    
    let categoryProducts = [];
    
    bouquetsData.forEach(category => {
        if (category.title === targetCategory) {
            categoryProducts = category.products;
        }
    });
    
    if (categoryProducts.length === 0) {
        productsContainer.innerHTML = '<div class="error">Категория не найдена</div>';
        return;
    }
    
    displayProducts(categoryProducts, productsContainer);
}

// Функция для отображения товаров в контейнере
function displayProducts(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }
    
    let html = '';
    
    products.forEach(product => {
        const starsHtml = createRatingStars(product.rating);
        
        const priceHtml = product.oldPrice 
            ? `<div class="product-price">
                <span class="current-price">${Number(product.price).toLocaleString()} ₽</span>
                <span class="old-price">${Number(product.oldPrice).toLocaleString()} ₽</span>
               </div>`
            : `<div class="product-price">${Number(product.price).toLocaleString()} ₽</div>`;
        
        let badgeHtml = '';
        if (product.rating >= 4.8) {
            badgeHtml = '<div class="product-badge">Хит продаж</div>';
        } else if (product.oldPrice) {
            const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            badgeHtml = `<div class="product-badge">-${discount}%</div>`;
        } else if (product.rating >= 4.5) {
            badgeHtml = '<div class="product-badge">Рейтинг ★' + product.rating + '</div>';
        }
        
        html += `
            <div class="product-card" data-category="${product.category || ''}">
                <div class="product-image" style="background-image: url('${product.image}')">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-rating">
                        ${starsHtml}
                        <span>(${product.reviews})</span>
                    </div>
                    ${priceHtml}
                    <div class="product-actions">
                        <button class="btn btn-small add-to-cart" 
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Добавляем обработчики для кнопок "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const product = {
                id: parseInt(button.dataset.id),
                name: button.dataset.name,
                price: parseInt(button.dataset.price),
                image: button.dataset.image,
                quantity: 1
            };
            
            console.log('🛒 Добавление в корзину:', product);
            
            if (window.cartUI && typeof window.cartUI.addItem === 'function') {
                const result = await window.cartUI.addItem(product);
                if (result) {
                    console.log('Товар добавлен в корзину');
                }
            } else {
                console.error('Корзина не найдена');
                alert('Ошибка: корзина не инициализирована');
            }
        });
    });
}

// Функция для получения параметра из URL
function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Защита от множественной инициализации
let isInitialized = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    if (isInitialized) {
        console.log('Инициализация уже была выполнена');
        return;
    }
    isInitialized = true;
    
    console.log('Инициализация catalog-loader');
    
    const isCatalogPage = window.location.pathname.includes('catalog.html');
    const isCategoryPage = window.location.pathname.includes('category.html');
    
    if (isCatalogPage) {
        await displayAllProducts();
        
        // Обработчики для фильтров
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const href = this.getAttribute('href');
                const categoryMatch = href.match(/cat=([^&]+)/);
                
                if (categoryMatch) {
                    const category = categoryMatch[1];
                    if (category === 'all') {
                        displayAllProducts();
                    } else {
                        displayCategoryProducts(category);
                    }
                }
            });
        });
        
        // Устанавливаем активный фильтр из URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentCat = urlParams.get('cat') || 'all';
        
        filterTabs.forEach(tab => {
            const href = tab.getAttribute('href');
            if (href.includes(`cat=${currentCat}`)) {
                tab.classList.add('active');
            } else if (currentCat === 'all' && href.includes('cat=all')) {
                tab.classList.add('active');
            }
        });
    }
    
    if (isCategoryPage) {
        const categoryId = getUrlParameter('cat');
        if (categoryId && categoryId !== 'all') {
            await displayCategoryProducts(categoryId);
        } else {
            await displayAllProducts();
        }
    }
});

// Добавляем стили для загрузки и ошибок
if (!document.getElementById('catalog-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'catalog-loader-styles';
    style.textContent = `
        .loading, .error, .no-products {
            text-align: center;
            padding: 50px;
            font-size: 1.2rem;
            grid-column: 1 / -1;
        }
        .loading {
            color: #795548;
        }
        .loading i {
            margin-right: 10px;
        }
        .error {
            color: #dc3545;
        }
        .no-products {
            color: #795548;
        }
        
        /* Стили для уведомления о добавлении в корзину */
        .cart-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 9999;
        }
        
        .cart-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .cart-notification i {
            font-size: 1.2rem;
        }
        
        /* Стили для счетчика корзины */
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #5d4037;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
        }
        
        a[href="cart.html"] {
            position: relative;
        }
    `;
    document.head.appendChild(style);
}

console.log('catalog-loader.js загружен');