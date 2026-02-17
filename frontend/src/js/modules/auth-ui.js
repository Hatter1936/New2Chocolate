if (typeof AuthUI === 'undefined') {
    class AuthUI {
        constructor() {
            this.init();
        }

        init() {
            this.updateHeader();
            // НИКАКОЙ защиты маршрутов!
        }

        // Обновление шапки в зависимости от статуса авторизации
        updateHeader() {
            const headerIcons = document.querySelector('.header-icons');
            if (!headerIcons) return;

            const token = localStorage.getItem('access_token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            if (token && user) {
                headerIcons.innerHTML = `
                    <div class="user-menu">
                        <span class="user-name">
                            <i class="fas fa-user-circle"></i>
                            ${user.username || 'Пользователь'}
                        </span>
                        <div class="user-dropdown">
                            <a href="#" onclick="authUI.logout()">Выйти</a>
                        </div>
                    </div>
                `;
            } else {
                headerIcons.innerHTML = `
                    <a href="login.html" class="login-link">
                        <i class="fas fa-sign-in-alt"></i>
                        Вход
                    </a>
                    <a href="register.html" class="register-link">
                        Регистрация
                    </a>
                `;
            }
        }

        // Выход из системы
        async logout() {
            if (window.auth && typeof window.auth.logout === 'function') {
                await window.auth.logout();
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                this.showNotification('Вы вышли из системы', 'info');
                setTimeout(() => window.location.reload(), 1000);
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

    window.authUI = new AuthUI();
}

// Добавляем стили только если их нет
if (!document.getElementById('auth-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-ui-styles';
    style.textContent = `
        .header-icons {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .login-link, .register-link {
            padding: 8px 15px;
            border-radius: 5px;
            text-decoration: none;
            transition: all 0.3s;
        }
        
        .login-link {
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
        
        .login-link:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .register-link {
            background: var(--primary-color);
            color: white;
        }
        
        .register-link:hover {
            background: var(--primary-dark);
        }
        
        .user-menu {
            position: relative;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 5px;
            transition: background 0.3s;
        }
        
        .user-menu:hover {
            background: #f5f5f5;
        }
        
        .user-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: var(--primary-color);
        }
        
        .user-name i {
            font-size: 1.2rem;
        }
        
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 10px 0;
            min-width: 150px;
            display: none;
            z-index: 1000;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .user-menu:hover .user-dropdown {
            display: block;
        }
        
        .user-dropdown a {
            display: block;
            padding: 8px 15px;
            color: #333;
            text-decoration: none;
            transition: background 0.3s;
        }
        
        .user-dropdown a:hover {
            background-color: #f5f5f5;
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