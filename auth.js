// Модуль авторизации пользователей
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadUser();
        this.updateUI();
        this.setupEventListeners();
    }

    loadUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
        }
    }

    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
        this.isAuthenticated = true;
        this.updateUI();
    }

    clearUser() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateUI();
    }

    register(userData) {
        return new Promise((resolve, reject) => {
            // Проверка существующих пользователей
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Проверка email
            if (users.some(u => u.email === userData.email)) {
                reject('Пользователь с таким email уже существует');
                return;
            }

            // Создание нового пользователя
            const newUser = {
                id: Date.now(),
                ...userData,
                createdAt: new Date().toISOString(),
                role: 'user',
                preferences: {
                    newsletter: userData.newsletter || false,
                    ageGroups: [],
                    categories: []
                }
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.saveUser(newUser);
            resolve(newUser);
        });
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.saveUser(user);
                resolve(user);
            } else {
                reject('Неверный email или пароль');
            }
        });
    }

    logout() {
        this.clearUser();
        window.location.href = 'index.html';
    }

    updateProfile(updates) {
        return new Promise((resolve, reject) => {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const index = users.findIndex(u => u.id === this.currentUser.id);
                
                if (index !== -1) {
                    users[index] = { ...users[index], ...updates };
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    this.currentUser = users[index];
                    this.saveUser(this.currentUser);
                    resolve(this.currentUser);
                } else {
                    reject('Пользователь не найден');
                }
            } catch (error) {
                reject('Ошибка обновления профиля');
            }
        });
    }

    updateUI() {
        const userMenu = document.getElementById('user-menu');
        const guestMenu = document.getElementById('guest-menu');
        const userGreeting = document.getElementById('user-greeting');
        const cartCounter = document.getElementById('cart-counter');

        if (this.isAuthenticated && userMenu && guestMenu) {
            userMenu.style.display = 'flex';
            guestMenu.style.display = 'none';
            
            if (userGreeting) {
                userGreeting.textContent = `👋 ${this.currentUser.name.split(' ')[0]}`;
            }
            
            // Обновление счетчика корзины
            if (cartCounter) {
                const cart = this.getCart();
                cartCounter.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            }
        } else if (!this.isAuthenticated && userMenu && guestMenu) {
            userMenu.style.display = 'none';
            guestMenu.style.display = 'flex';
            
            if (cartCounter) {
                cartCounter.textContent = '0';
            }
        }
    }

    setupEventListeners() {
        // Логин форма
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('#login-email').value;
                const password = loginForm.querySelector('#login-password').value;
                
                this.login(email, password)
                    .then(() => {
                        window.location.href = 'index.html';
                    })
                    .catch(error => {
                        alert(error);
                    });
            });
        }

        // Регистрация форма
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const userData = {
                    name: registerForm.querySelector('#register-name').value,
                    email: registerForm.querySelector('#register-email').value,
                    phone: registerForm.querySelector('#register-phone').value,
                    password: registerForm.querySelector('#register-password').value,
                    newsletter: registerForm.querySelector('#newsletter').checked
                };

                const confirmPassword = registerForm.querySelector('#register-confirm').value;
                
                if (userData.password !== confirmPassword) {
                    alert('Пароли не совпадают');
                    return;
                }

                if (userData.password.length < 8) {
                    alert('Пароль должен содержать минимум 8 символов');
                    return;
                }

                this.register(userData)
                    .then(() => {
                        window.location.href = 'index.html';
                    })
                    .catch(error => {
                        alert(error);
                    });
            });
        }

        // Выход
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Переключение видимости пароля
        const showPasswordToggle = document.getElementById('show-password');
        if (showPasswordToggle) {
            showPasswordToggle.addEventListener('change', (e) => {
                const passwordInput = document.getElementById('login-password');
                passwordInput.type = e.target.checked ? 'text' : 'password';
            });
        }

        // Проверка сложности пароля
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let color = '#ff6b6b';
        let text = 'Слабый';

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                color = '#ff6b6b';
                text = 'Слабый';
                break;
            case 2:
                color = '#ffa726';
                text = 'Средний';
                break;
            case 3:
                color = '#4caf50';
                text = 'Хороший';
                break;
            case 4:
                color = '#2e7d32';
                text = 'Отличный';
                break;
        }

        strengthBar.style.width = `${strength * 25}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = `Сложность пароля: ${text}`;
        strengthText.style.color = color;
    }

    // Методы для работы с корзиной
    getCart() {
        if (!this.isAuthenticated) {
            return JSON.parse(localStorage.getItem('guest_cart') || '{"items": []}');
        }
        
        const userCartKey = `cart_${this.currentUser.id}`;
        return JSON.parse(localStorage.getItem(userCartKey) || '{"items": []}');
    }

    saveCart(cart) {
        if (!this.isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(cart));
        } else {
            const userCartKey = `cart_${this.currentUser.id}`;
            localStorage.setItem(userCartKey, JSON.stringify(cart));
        }
        this.updateUI();
    }

    addToCart(product) {
        const cart = this.getCart();
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            cart.items.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart(cart);
    }

    removeFromCart(productId) {
        const cart = this.getCart();
        cart.items = cart.items.filter(item => item.id !== productId);
        this.saveCart(cart);
    }

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    }

    clearCart() {
        this.saveCart({ items: [] });
    }

    getCartTotal() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
}

// Инициализация авторизации
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});