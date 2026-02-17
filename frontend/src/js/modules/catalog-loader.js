let isLoading = false;
let lastLoadTime = 0;
const MIN_LOAD_INTERVAL = 2000;
let cachedProducts = null;

async function loadBouquetsData(forceRefresh = false) {
    // Защита от слишком частых вызовов
    const now = Date.now();
    if (!forceRefresh && isLoading) {
        console.log('Загрузка уже выполняется, пропускаем');
        return null;
    }
    
    if (!forceRefresh && cachedProducts) {
        console.log('Используем кешированные данные');
        return cachedProducts;
    }
    
    if (!forceRefresh && (now - lastLoadTime < MIN_LOAD_INTERVAL)) {
        console.log('Слишком частые запросы, пропускаем');
        return null;
    }
    
    isLoading = true;
    lastLoadTime = now;
    
    try {
        const API_URL = 'http://127.0.0.1:8000/api/catalog/products/';
        console.log('Загружаем с URL:', API_URL);
        
        const response = await fetch(API_URL);
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Сырые данные от API:', data);
        
        const products = data.results || data; 
        console.log('Товары после обработки:', products);
        console.log('Количество товаров:', products.length);
        
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
        console.log('Итоговые данные для фронтенда:', result);
        
        // Сохраняем в кеш
        cachedProducts = result;
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
    
    // Полные звезды
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Половина звезды
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Пустые звезды
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Функция для отображения всех товаров
async function displayAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Показываем загрузку
    productsContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    const bouquetsData = await loadBouquetsData();
    
    console.log('displayAllProducts получил данные:', bouquetsData);
    
    if (!bouquetsData || !Array.isArray(bouquetsData)) {
        productsContainer.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
        return;
    }
    
    // Собираем все товары из всех категорий
    let allProducts = [];
    
    bouquetsData.forEach((category, index) => {
        console.log(`Обрабатываем категорию ${index}:`, category);
        
        if (!category || typeof category !== 'object' || !category.products) {
            console.warn('Пропускаем некорректную категорию:', category);
            return;
        }
        
        const categoryTitle = category.title || 'Без названия';
        const categoryProducts = category.products;
        
        console.log(`Категория "${categoryTitle}", товаров: ${categoryProducts.length}`);
        
        if (Array.isArray(categoryProducts)) {
            categoryProducts.forEach(product => {
                allProducts.push({
                    ...product,
                    category: categoryTitle.toLowerCase().replace(/ /g, '-'),
                    categoryTitle: categoryTitle
                });
            });
        } else {
            console.warn('products не является массивом:', categoryProducts);
        }
    });
    
    console.log('Всего товаров собрано:', allProducts.length);
    
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }
    
    // Отображаем товары
    displayProducts(allProducts, productsContainer);
}

// Функция для отображения товаров конкретной категории
async function displayCategoryProducts(categoryId) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    const bouquetsData = await loadBouquetsData();
    
    if (!bouquetsData) {
        productsContainer.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
        return;
    }
    
    const categoryMap = {
        'milk': 'Романтические букеты',
        'dark': 'Свадебные букеты',
        'white': 'Весенние букеты',
        'ruby': 'Букеты на день рождения',
        'color': 'Деловые букеты',
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
                <span class="current-price">${product.price.toLocaleString()} ₽</span>
                <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>
               </div>`
            : `<div class="product-price">${product.price.toLocaleString()} ₽</div>`;
        
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
    
    // ЕДИНСТВЕННЫЙ обработчик для кнопок "В корзину"
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
            
            console.log('Добавление в корзину:', product);
            
            if (window.cartUI && typeof window.cartUI.addItem === 'function') {
                await window.cartUI.addItem(product);
            } else {
                console.error('cartUI не найден');
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
    // Защита от множественных вызовов
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
    }
    
    if (isCategoryPage) {
        const categoryId = getUrlParameter('cat');
        if (categoryId && categoryId !== 'all') {
            await displayCategoryProducts(categoryId);
        } else {
            await displayAllProducts();
        }
    }
    
    if (isCatalogPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const currentCat = urlParams.get('cat') || 'all';
        
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            const href = tab.getAttribute('href');
            if (href.includes(`cat=${currentCat}`)) {
                tab.classList.add('active');
            } else if (currentCat === 'all' && href.includes('cat=all')) {
                tab.classList.add('active');
            }
        });
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
            color: var(--secondary-color);
        }
        .error {
            color: #dc3545;
        }
        .no-products {
            color: var(--secondary-color);
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
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}