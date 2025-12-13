// Модуль управления корзиной
class CartManager {
    constructor() {
        this.cart = auth ? auth.getCart() : { items: [] };
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
    }

    renderCart() {
        const cartContent = document.getElementById('cart-content');
        const emptyCart = document.getElementById('empty-cart');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!cartContent || !emptyCart) return;

        if (this.cart.items.length === 0) {
            cartContent.style.display = 'none';
            emptyCart.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        cartContent.style.display = 'block';
        emptyCart.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;

        // Очистка содержимого
        cartContent.innerHTML = '';

        // Рендеринг товаров
        this.cart.items.forEach(item => {
            const itemElement = this.createCartItemElement(item);
            cartContent.appendChild(itemElement);
        });

        // Расчет итогов
        const subtotal = this.cart.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 3000 ? 0 : 500; // Бесплатная доставка от 3000
        const discount = 0; // Здесь можно добавить логику скидок
        const total = subtotal + shipping - discount;

        if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} ₽`;
        if (totalEl) totalEl.textContent = `${total.toLocaleString()} ₽`;
        
        // Обновление счетчика в шапке
        const cartCounter = document.getElementById('cart-counter');
        if (cartCounter) {
            const totalItems = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCounter.textContent = totalItems;
        }
    }

    createCartItemElement(item) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-image">${item.image || '🎁'}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-category">${item.category || 'Игрушка'}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    🗑️ Удалить
                </button>
                <div class="item-total">
                    ${(item.price * item.quantity).toLocaleString()} ₽
                </div>
            </div>
        `;
        return div;
    }

    setupEventListeners() {
        // Обработка кликов на кнопках
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-btn')) {
                const button = e.target.closest('.quantity-btn');
                const productId = button.dataset.id;
                const isPlus = button.classList.contains('plus');
                
                const item = this.cart.items.find(i => i.id == productId);
                if (item) {
                    const newQuantity = isPlus ? item.quantity + 1 : item.quantity - 1;
                    if (auth) {
                        auth.updateQuantity(productId, newQuantity);
                    } else {
                        this.updateQuantity(productId, newQuantity);
                    }
                    this.cart = auth ? auth.getCart() : this.cart;
                    this.renderCart();
                }
            }

            if (e.target.closest('.remove-item')) {
                const button = e.target.closest('.remove-item');
                const productId = button.dataset.id;
                
                if (auth) {
                    auth.removeFromCart(productId);
                } else {
                    this.removeFromCart(productId);
                }
                this.cart = auth ? auth.getCart() : this.cart;
                this.renderCart();
            }
        });

        // Кнопка оформления заказа
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!auth.isAuthenticated) {
                    window.location.href = 'login.html?redirect=checkout';
                    return;
                }
                
                if (this.cart.items.length === 0) {
                    alert('Корзина пуста');
                    return;
                }
                
                // Здесь будет переход к оформлению заказа
                window.location.href = 'checkout.html';
            });
        }

        // Применение промокода
        const applyPromoBtn = document.getElementById('apply-promo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                const promoInput = document.getElementById('promo-input');
                const promoCode = promoInput.value.trim();
                
                if (!promoCode) {
                    alert('Введите промокод');
                    return;
                }
                
                // Здесь будет проверка промокода
                alert(`Промокод "${promoCode}" применен!`);
                promoInput.value = '';
            });
        }

        // Кнопки добавления в корзину на странице каталога
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-to-cart')) {
                e.preventDefault();
                const button = e.target.closest('.btn-add-to-cart');
                const product = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    image: button.dataset.image,
                    category: button.dataset.category
                };
                
                if (auth) {
                    auth.addToCart(product);
                } else {
                    this.addToCart(product);
                }
                
                // Показываем уведомление
                this.showNotification(`${product.name} добавлен в корзину!`);
            }
        });
    }

    // Методы для работы с корзиной (для неавторизованных пользователей)
    addToCart(product) {
        const existingItem = this.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.items.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.renderCart();
    }

    removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.items.find(item => item.id == productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    saveCart() {
        if (auth && auth.isAuthenticated) {
            auth.saveCart(this.cart);
        } else {
            localStorage.setItem('guest_cart', JSON.stringify(this.cart));
        }
    }

    showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span>${message}</span>
            </div>
        `;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Добавляем CSS для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 20px;
    }
`;
document.head.appendChild(style);

// Инициализация менеджера корзины
document.addEventListener('DOMContentLoaded', () => {
    if (window.auth) {
        window.cartManager = new CartManager();
    }
});