// Данные о букетах (можно вынести в отдельный файл)
const bouquetsData = {
    wedding: {
        title: "Свадебные букеты",
        description: "Идеальные букеты для вашего особенного дня. Созданы с любовью и вниманием к деталям.",
        products: [
            {
                id: 1,
                name: "Невеста",
                description: "Белые пионы, розы, эвкалипт",
                price: 5000,
                image: "https://i.pinimg.com/736x/b2/96/77/b2967780076aac925b6c4a7398be6788.jpg",
                rating: 5,
                reviews: 12
            },
            {
                id: 2,
                name: "Элегантность",
                description: "Белые розы, гортензии",
                price: 4200,
                image: "https://i.pinimg.com/736x/c4/ae/f0/c4aef06a3a32c70ce1ed75271ab1d3e5.jpg",
                rating: 4,
                reviews: 8
            }
        ]
    },
    birthday: {
        title: "Букеты на день рождения",
        description: "Яркие и праздничные композиции для самых радостных моментов.",
        products: [
            {
                id: 4,
                name: "Радость",
                description: "Яркие герберы и хризантемы",
                price: 3200,
                image: "https://i.pinimg.com/736x/c3/e2/60/c3e26031a5be296b2db4df0cbe002d74.jpg",
                rating: 4,
                reviews: 7
            },
            {
                id: 5,
                name: "Праздник",
                description: "Ранункулюсы, тюльпаны и гиацинты",
                price: 4800,
                image: "https://i.pinimg.com/736x/1b/d5/bc/1bd5bca8f6efdfcee2b1c03e0906dc40.jpg",
                rating: 5,
                reviews: 10
            }
        ]
    },
    romantic: {
        title: "Романтические букеты",
        description: "Для признаний в любви и особенных моментов.",
        products: [
            {
                id: 6,
                name: "Любимой",
                description: "Красные розы, гипсофила",
                price: 3200,
                image: "https://i.pinimg.com/736x/03/93/d7/0393d78272a9a765b7520dcb59154c57.jpg",
                rating: 5,
                reviews: 24
            },
            {
                id: 7,
                name: "Нежность",
                description: "Розы, пионы, эвкалипт",
                price: 3500,
                image: "https://i.pinimg.com/736x/1a/4f/69/1a4f691a708ad3a6c7a5681aa8a183e4.jpg",
                rating: 4,
                reviews: 18
            },
            {
                id: 3,
                name: "Романтический букет",
                description: "Нежные розы и пионы в элегантной упаковке",
                price: 3500,
                oldPrice: 4200,
                image: "https://i.pinimg.com/736x/97/78/33/9778339cf8a1e1e1851e6b6ed4ce81c6.jpg",
                rating: 4.5,
                reviews: 24
            }
        ]
    },
    business: {
        title: "Деловые букеты",
        description: "Строгие и элегантные композиции для бизнес-партнеров.",
        products: [
            {
                id: 12,
                name: "Королевский",
                description: "Орхидеи, розы, каллы",
                price: 6500,
                image: "https://i.pinimg.com/736x/f9/33/bb/f933bbe990be5869572403ecf0b7b10f.jpg",
                rating: 5,
                reviews: 6
            }
        ]
    },
    spring: {
        title: "Весенние букеты",
        description: "Свежие и яркие композиции, наполненные ароматами весны.",
        products: [
            {
                id: 10,
                name: "Весеннее настроение",
                description: "ТЯркие тюльпаны и гиацинты в корзине",
                price: 2800,
                image: "https://i.pinimg.com/736x/48/8b/9b/488b9b95779fdf4cf9a10121874ee0e2.jpg",
                rating: 4,
                reviews: 18
            }
        ]
    }
};


// Функция для получения параметра из URL
function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Загрузка данных категории
document.addEventListener('DOMContentLoaded', function() {
    const categoryId = getUrlParameter('cat');
    const categoryData = bouquetsData[categoryId];
    
    if (categoryData) {
        // Устанавливаем заголовок и описание
        document.getElementById('category-title').textContent = categoryData.title;
        document.getElementById('category-description').textContent = categoryData.description;
        document.getElementById('current-category').textContent = categoryData.title;
        
        // Генерируем карточки товаров
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '';
        
        categoryData.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-img" style="background-image: url('${product.image}')"></div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                        ${product.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                        ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rating))}
                        <span>(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                    </div>
                    <a href="order.html?id=${product.id}" class="btn btn-small">Заказать</a>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    } else {
        
        document.getElementById('category-title').textContent = 'Категория не найдена';
        document.getElementById('category-description').textContent = 'Попробуйте выбрать другую категорию из каталога';
    }
});