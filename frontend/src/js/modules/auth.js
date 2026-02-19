if (typeof Auth === 'undefined') {
    class Auth {
        constructor() {
            this.apiUrl = 'http://127.0.0.1:8000/api/auth/';
            this.checkAuth();
        }

        // Проверка авторизации при загрузке
        checkAuth() {
            const token = localStorage.getItem('access_token');
            if (token) {
                this.updateUIForAuth();
            }
        }

        // Обновление интерфейса для авторизованного пользователя
        updateUIForAuth() {
            const headerIcons = document.querySelector('.header-icons');
            if (headerIcons) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                headerIcons.innerHTML = `
                    <div class="user-menu">
                        <span class="user-name">
                            <i class="fas fa-user-circle"></i>
                            ${user.username || 'Пользователь'}
                        </span>
                        <div class="user-dropdown">
                            <a href="#" onclick="auth.logout()">Выйти</a>
                        </div>
                    </div>
                `;
            }
        }

        // Регистрация
        async register(userData) {
            try {
                // Проверка паролей (дублируем на клиенте для надежности)
                if (userData.password !== userData.password2) {
                    this.showNotification('Пароли не совпадают', 'error');
                    return { success: false, error: { password: ['Пароли не совпадают'] } };
                }

                console.log('📝 Регистрация с данными:', userData);
                
                const response = await fetch(`${this.apiUrl}register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                console.log('📝 Статус:', response.status);
                console.log('📝 Ответ:', data);

                if (response.ok) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    this.showNotification('Регистрация успешна!', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                    
                    return { success: true, data };
                } else {
                    // Подробный разбор ошибок
                    let errorMessage = 'Ошибка регистрации';
                    
                    if (typeof data === 'object') {
                        if (data.username) errorMessage = data.username[0];
                        else if (data.email) errorMessage = data.email[0];
                        else if (data.password) errorMessage = data.password[0];
                        else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
                        else if (data.detail) errorMessage = data.detail;
                        else if (data.error) errorMessage = data.error;
                        else errorMessage = JSON.stringify(data);
                    }
                    
                    console.error('❌ Ошибка регистрации:', errorMessage);
                    this.showNotification(errorMessage, 'error');
                    return { success: false, error: data };
                }
            } catch (error) {
                console.error('❌ Ошибка соединения:', error);
                this.showNotification('Ошибка соединения с сервером', 'error');
                return { success: false, error };
            }
        }

        // Вход
        async login(credentials) {
            try {
                console.log('Вход с данными:', credentials);
                
                // Подготавливаем данные для API
                const apiData = {};
                if (credentials.email) {
                    apiData.email = credentials.email;
                } else if (credentials.username) {
                    // Если передан username, но API ждет email - пробуем как email
                    apiData.email = credentials.username;
                } else {
                    apiData.email = credentials.email;
                }
                apiData.password = credentials.password;
                
                const response = await fetch(`${this.apiUrl}login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                const data = await response.json();
                console.log('Статус ответа:', response.status);
                console.log('Данные ответа:', data);

                if (response.ok) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    this.showNotification('Вход выполнен!', 'success');
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect') || 'index.html';
                    
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 1500);
                    
                    return { success: true, data };
                } else {
                    let errorMessage = 'Ошибка входа';
                    if (data.email) errorMessage = data.email[0];
                    else if (data.username) errorMessage = data.username[0];
                    else if (data.password) errorMessage = data.password[0];
                    else if (data.detail) errorMessage = data.detail;
                    else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
                    else if (data.error) errorMessage = data.error;
                    else errorMessage = JSON.stringify(data);
                    
                    console.error('Ошибка входа:', errorMessage);
                    this.showNotification(errorMessage, 'error');
                    return { success: false, error: data };
                }
            } catch (error) {
                console.error('Ошибка соединения:', error);
                this.showNotification('Ошибка соединения с сервером', 'error');
                return { success: false, error };
            }
        }

        // Выход
        async logout() {
            const refreshToken = localStorage.getItem('refresh_token');
            
            try {
                if (refreshToken) {
                    await fetch(`${this.apiUrl}logout/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refresh: refreshToken })
                    });
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            
            this.showNotification('Вы вышли из системы', 'info');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        // Получение текущего пользователя
        getCurrentUser() {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }

        // Проверка, авторизован ли пользователь
        isAuthenticated() {
            return !!localStorage.getItem('access_token');
        }

        // Показать уведомление
        showNotification(message, type = 'info') {
            // Используем уведомление из auth-ui если есть
            if (window.authUI && typeof window.authUI.showNotification === 'function') {
                window.authUI.showNotification(message, type);
                return;
            }
            
            // Своё уведомление на всякий случай
            const notification = document.createElement('div');
            notification.className = `auth-notification ${type}`;
            notification.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                               type === 'error' ? 'fa-exclamation-circle' : 
                               'fa-info-circle'}"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Создаем глобальный экземпляр
    window.auth = new Auth();
}

// Добавляем стили только если их нет
if (!document.getElementById('auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
        .auth-notification {
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
        
        .auth-notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .auth-notification.success {
            background-color: #4CAF50;
        }
        
        .auth-notification.error {
            background-color: #f44336;
        }
        
        .auth-notification.info {
            background-color: #2196F3;
        }
    `;
    document.head.appendChild(style);
}