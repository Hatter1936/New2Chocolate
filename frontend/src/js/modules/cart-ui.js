if (window.cartUI) {
    console.log('cartUI уже существует, используем существующий');
} else {
    class CartUI {
        constructor() {
            console.log('Создание нового CartUI');
            this.apiUrl = 'http://127.0.0.1:8000/api/cart/';
            this.cachedCart = null;
            this.lastRequestTime = 0;
            this.init();
        }

        async init() {
            console.log('Инициализация CartUI');
            
            // Получаем корзину ОДИН РАЗ при загрузке
            const cart = await this.getCart();
            
            if (cart) {
                // Обновляем счетчик
                this.updateCartCounter(cart);
                
                // Если мы на странице корзины, отрисовываем её
                if (window.location.pathname.includes('cart.html')) {
                    await this.renderCartPage(cart);
                }
            }
            
            // Добавляем обработчик для радио-кнопок доставки
            this.initDeliveryHandlers();
        }

        // Обновление счетчика в шапке
        updateCartCounter(cart) {
            if (!cart || !cart.items) return;
            
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            
            let cartIcon = document.querySelector('.cart-icon-wrapper');
            const cartLink = document.querySelector('a[href="cart.html"]');
            
            if (cartLink) {
                if (!cartIcon) {
                    cartIcon = document.createElement('span');
                    cartIcon.className = 'cart-icon-wrapper';
                    cartLink.innerHTML = '<i class="fa-solid fa-cart-shopping"></i>';
                    cartLink.appendChild(cartIcon);
                }
                
                if (totalItems > 0) {
                    cartIcon.innerHTML = `<span class="cart-count">${totalItems}</span>`;
                } else {
                    cartIcon.innerHTML = '';
                }
            }
        }

        // Инициализация обработчиков доставки
        initDeliveryHandlers() {
            if (!window.location.pathname.includes('cart.html')) return;
            
            const deliveryRadios = document.querySelectorAll('input[name="delivery-type"]');
            const deliveryForm = document.getElementById('delivery-form');
            const pickupForm = document.getElementById('pickup-form');

            if (deliveryRadios.length) {
                deliveryRadios.forEach(radio => {
                    radio.addEventListener('change', function() {
                        if (this.value === 'delivery') {
                            deliveryForm?.classList.add('active');
                            pickupForm?.classList.remove('active');
                        } else {
                            deliveryForm?.classList.remove('active');
                            pickupForm?.classList.add('active');
                        }
                    });
                });
            }
        }

        // Получение корзины с сервера (с кешированием)
        async getCart() {
            const now = Date.now();
            
            // Защита от слишком частых запросов (минимум 2 секунды)
            if (now - this.lastRequestTime < 2000) {
                console.log('Слишком частые запросы, используем кеш');
                return this.cachedCart;
            }
            
            try {
                console.log('Запрос корзины...');
                this.lastRequestTime = now;
                
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(this.apiUrl, {
                    headers: headers
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Корзина получена:', data);
                    this.cachedCart = data; // Сохраняем в кеш
                    return data;
                }
                return this.cachedCart;
            } catch (error) {
                console.error('Ошибка получения корзины:', error);
                return this.cachedCart;
            }
        }

        // Добавление товара в корзину
        async addItem(product) {
            try {
                console.log('🛒 Добавление товара:', product);
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${this.apiUrl}add_item/`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: product.quantity || 1
                    })
                });

                if (response.ok) {
                    // Получаем обновлённую корзину
                    const updatedCart = await response.json();
                    this.cachedCart = updatedCart; // Обновляем кеш
                    
                    // Обновляем счётчик
                    this.updateCartCounter(updatedCart);
                    
                    // Показываем уведомление
                    this.showNotification('Товар добавлен в корзину', 'success');
                    
                    // Если мы на странице корзины, перерисовываем
                    if (window.location.pathname.includes('cart.html')) {
                        this.renderCartPage(updatedCart);
                    }
                    return true;
                } else {
                    const error = await response.json();
                    this.showNotification(error.error || 'Ошибка добавления', 'error');
                    return false;
                }
            } catch (error) {
                console.error('Ошибка добавления в корзину:', error);
                this.showNotification('Ошибка соединения', 'error');
                return false;
            }
        }

        // Обновление количества товара
        async updateItem(itemId, quantity) {
            if (quantity < 1) {
                return this.removeItem(itemId);
            }
            
            try {
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${this.apiUrl}update_item/`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        item_id: itemId,
                        quantity: quantity
                    })
                });

                if (response.ok) {
                    const updatedCart = await response.json();
                    this.cachedCart = updatedCart;
                    this.updateCartCounter(updatedCart);
                    
                    if (window.location.pathname.includes('cart.html')) {
                        this.renderCartPage(updatedCart);
                    }
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Ошибка обновления:', error);
                return false;
            }
        }

        // Удаление товара
        async removeItem(itemId) {
            try {
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${this.apiUrl}remove_item/`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        item_id: itemId
                    })
                });

                if (response.ok) {
                    const updatedCart = await response.json();
                    this.cachedCart = updatedCart;
                    this.updateCartCounter(updatedCart);
                    
                    if (window.location.pathname.includes('cart.html')) {
                        this.renderCartPage(updatedCart);
                    }
                    this.showNotification('Товар удален', 'info');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Ошибка удаления:', error);
                return false;
            }
        }

        // Очистка корзины
        async clearCart() {
            try {
                const token = localStorage.getItem('access_token');
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${this.apiUrl}clear/`, {
                    method: 'POST',
                    headers: headers
                });

                if (response.ok) {
                    const updatedCart = await response.json();
                    this.cachedCart = updatedCart;
                    this.updateCartCounter(updatedCart);
                    
                    if (window.location.pathname.includes('cart.html')) {
                        this.renderCartPage(updatedCart);
                    }
                    this.showNotification('🧹 Корзина очищена', 'info');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Ошибка очистки:', error);
                return false;
            }
        }

        // Отрисовка страницы корзины
        async renderCartPage(cart) {
            const cartContainer = document.querySelector('.cart-layout');
            if (!cartContainer) return;

            if (!cart || !cart.items || cart.items.length === 0) {
                cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <h2>Корзина пуста</h2>
                        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
                        <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
                    </div>
                `;
                return;
            }

            let itemsHtml = '';
            cart.items.forEach(item => {
                itemsHtml += `
                    <div class="cart-item" data-item-id="${item.id}">
                        <div class="cart-item-image" style="background-image: url('${item.product.main_image || 'https://via.placeholder.com/100'}')"></div>
                        <div class="cart-item-details">
                            <h3>${item.product.name}</h3>
                            <p class="cart-item-price">${Number(item.product.price).toLocaleString()} ₽</p>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" onclick="cartUI.updateItem(${item.id}, ${item.quantity - 1})">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" readonly>
                                <button class="quantity-btn" onclick="cartUI.updateItem(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" onclick="cartUI.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            });

            cartContainer.innerHTML = `
                <div class="cart-items">
                    <h2>Товары в корзине</h2>
                    ${itemsHtml}
                </div>
                <div class="cart-checkout">
                    <h2>Оформление заказа</h2>
                    <div class="checkout-section">
                        <h3>Способ получения</h3>
                        <div class="delivery-options">
                            <label class="delivery-option">
                                <input type="radio" name="delivery-type" value="delivery" checked>
                                <span class="option-content">
                                    <i class="fas fa-truck"></i>
                                    <span>Доставка</span>
                                </span>
                            </label>
                            <label class="delivery-option">
                                <input type="radio" name="delivery-type" value="pickup">
                                <span class="option-content">
                                    <i class="fas fa-store"></i>
                                    <span>Самовывоз</span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="cart-total">
                        <div class="total-row">
                            <span>Товары (${cart.items.length} шт.)</span>
                            <span class="total-price">${Number(cart.total_price).toLocaleString()} ₽</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Итого</span>
                            <span class="total-price-grand">${Number(cart.total_price).toLocaleString()} ₽</span>
                        </div>
                    </div>
                    <button class="btn btn-checkout" onclick="cartUI.createOrder()">Оформить заказ</button>
                </div>
            `;
        }

        // Создание заказа
        async createOrder() {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                this.showNotification('Необходимо войти в систему', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=cart.html';
                }, 1500);
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/orders/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.showNotification('Заказ успешно оформлен!', 'success');
                    this.cachedCart = null; // Очищаем кеш
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    this.showNotification('Ошибка оформления заказа', 'error');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                this.showNotification('Ошибка соединения', 'error');
            }
        }

        // Показать уведомление
        showNotification(message, type = 'info') {
            const notification = document.getElementById('notification') || this.createNotification();
            notification.className = `notification show ${type}`;
            notification.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                               type === 'error' ? 'fa-exclamation-circle' : 
                               'fa-info-circle'}"></i>
                <span>${message}</span>
            `;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        createNotification() {
            const div = document.createElement('div');
            div.id = 'notification';
            document.body.appendChild(div);
            return div;
        }
    }

    // Создаем глобальный экземпляр ТОЛЬКО ОДИН РАЗ
    window.cartUI = new CartUI();
}

// Добавляем стили только если их нет
if (!document.getElementById('cart-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-ui-styles';
    style.textContent = `
        .cart-icon-wrapper {
            position: relative;
        }
        
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--primary-color);
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
        
        .empty-cart {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 10px;
        }
        
        .empty-cart i {
            font-size: 4rem;
            color: var(--secondary-color);
            margin-bottom: 20px;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10000;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #f44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
    `;
    document.head.appendChild(style);
}