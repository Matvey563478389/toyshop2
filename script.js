// Базовые функции для сайта
document.addEventListener('DOMContentLoaded', function() {
    initCommonFeatures();
    
    // Инициализация специфичных для страницы функций
    if (document.querySelector('.toys-catalog')) {
        initCatalog();
    }
    
    if (document.querySelector('.skills-development')) {
        initBenefits();
    }
});

// Общие функции для всех страниц
function initCommonFeatures() {
    initAnimations();
    setActiveNav();
    initModal();
}

// Анимация появления элементов при скролле
function initAnimations() {
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.about-card, .age-card, .toy-card, .skill-category, .tip-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    const elements = document.querySelectorAll('.about-card, .age-card, .toy-card, .skill-category, .tip-card');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
}

// Активная навигация
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Функции для каталога
function initCatalog() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const ageSelect = document.getElementById('ageSelect');
    const toyCards = document.querySelectorAll('.toy-card');

    // Фильтрация по категориям
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            filterToys();
        });
    });

    // Фильтрация по возрасту
    if (ageSelect) {
        ageSelect.addEventListener('change', filterToys);
    }

    function filterToys() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const selectedAge = ageSelect ? ageSelect.value : 'all';
        
        toyCards.forEach(card => {
            const category = card.dataset.category;
            const age = card.dataset.age;
            
            const categoryMatch = activeFilter === 'all' || category.includes(activeFilter);
            const ageMatch = selectedAge === 'all' || age === selectedAge;
            
            if (categoryMatch && ageMatch) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Обработка кнопок "Подробнее"
    const detailButtons = document.querySelectorAll('.btn-details');
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.toy-card');
            const toyName = card.querySelector('h3').textContent;
            const toyDesc = card.querySelector('.toy-desc').textContent;
            const toyAge = card.querySelector('.toy-age').textContent;
            
            showToyDetails(toyName, toyDesc, toyAge);
        });
    });
}

// Функции для модального окна
function initModal() {
    const modal = document.getElementById('toyModal');
    const closeModal = document.querySelector('.close-modal');

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showToyDetails(name, description, age) {
    const modal = document.getElementById('toyModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Возраст:</strong> ${age}</p>
        <p><strong>Описание:</strong> ${description}</p>
        <div class="modal-features">
            <h4>Развивающие особенности:</h4>
            <ul>
                <li>Стимулирует познавательную активность</li>
                <li>Развивает моторику и координацию</li>
                <li>Улучшает социальные навыки</li>
                <li>Способствует творческому мышлению</li>
            </ul>
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="addToFavorites('${name}')">Добавить в избранное</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Функции для страницы benefits
function initBenefits() {
    // Добавляем интерактивность для skill categories
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach(category => {
        category.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
}

// Дополнительные функции
function addToFavorites(toyName) {
    alert(`Игрушка "${toyName}" добавлена в избранное!`);
    // Здесь можно добавить логику для реального добавления в избранное
}

// Функция для поиска игрушек (можно добавить позже)
function searchToys(query) {
    console.log('Поиск игрушек:', query);
    // Реализация поиска
}

console.log('Сайт "Мир детских игрушек" полностью загружен!');