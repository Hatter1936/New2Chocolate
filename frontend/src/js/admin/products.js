// Загрузка данных из JSON файла
async function loadProductsData() {
    try {
        const response = await fetch('goods.json?t=' + Date.now()); // Добавляем timestamp чтобы избежать кэширования
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return null;
    }
}

// Преобразование данных в плоский список для таблицы
function flattenProducts(bouquetsData) {
    if (!bouquetsData) return [];
    
    let allProducts = [];
    
    bouquetsData.forEach(categoryObj => {
        // Получаем ключ категории (dark, milk, ruby, white, color)
        const categoryKey = Object.keys(categoryObj)[0];
        const categoryData = categoryObj[categoryKey];
        
        // Добавляем категорию к каждому товару
        categoryData.products.forEach(product => {
            allProducts.push({
                ...product,
                categoryKey: categoryKey,
                categoryName: categoryKey === 'dark' ? 'Горький' :
                             categoryKey === 'milk' ? 'Молочный' :
                             categoryKey === 'ruby' ? 'Рубиновый' :
                             categoryKey === 'white' ? 'Белый' :
                             categoryKey === 'color' ? 'Цветной' : categoryKey
            });
        });
    });
    
    return allProducts;
}

// Сохранение данных в JSON файл (через сервер)
async function saveProductsData(bouquetsData) {
    try {
        // В реальном проекте здесь был бы POST запрос к серверу
        // Но для демонстрации сохраняем в localStorage
        console.log('Данные для сохранения:', bouquetsData);
        
        // Сохраняем в localStorage для отладки
        localStorage.setItem('debug_goods', JSON.stringify(bouquetsData, null, 2));
        
        // Показываем сообщение, что в реальном проекте данные бы сохранились
        Notification.show('В демо-режиме данные сохраняются в localStorage. Для реального сохранения нужен сервер.', 'warning');
        
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        Notification.show('Ошибка сохранения данных', 'error');
        return false;
    }
}

// Преобразование плоского списка обратно в формат goods.json
function unflattenProducts(products) {
    // Группируем по категориям
    const categories = {
        'dark': { title: 'Свадебные букеты', description: 'Идеальные букеты для вашего особенного дня. Созданы с любовью и вниманием к деталям.', products: [] },
        'milk': { title: 'Романтические букеты', description: 'Для признаний в любви и особенных моментов.', products: [] },
        'ruby': { title: 'Букеты на день рождения', description: 'Яркие и праздничные композиции для самых радостных моментов.', products: [] },
        'white': { title: 'Весенние букеты', description: 'Свежие и яркие композиции, наполненные ароматами весны.', products: [] },
        'color': { title: 'Деловые букеты', description: 'Строгие и элегантные композиции для бизнес-партнеров.', products: [] }
    };
    
    products.forEach(product => {
        const categoryKey = product.categoryKey;
        if (categories[categoryKey]) {
            // Создаём копию товара без служебных полей
            const { categoryKey, categoryName, ...productData } = product;
            categories[categoryKey].products.push(productData);
        }
    });
    
    // Преобразуем в формат goods.json
    return Object.keys(categories).map(key => ({
        [key]: categories[key]
    }));
}