class ImageModal {
    constructor() {
        this.modalOverlay = null;
        this.modalContent = null;
        this.modalImage = null;
        this.closeButton = null;
        this.isAnimating = false;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentZoom = 1;
        this.magnifierSize = 150; // Tamaño de la lupa
        this.magnifier = null;

        // Bind methods
        this.close = this.close.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    create(imageSrc) {
        if (document.querySelector('.modal-overlay')) {
            return;
        }

        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';

        this.modalContent = document.createElement('div');
        this.modalContent.className = 'card-modal';

        // Crear contenedor para la imagen
        const imageContainer = document.createElement('div');
        imageContainer.className = 'modal-image-container';

        // Crear y configurar la imagen principal
        this.modalImage = document.createElement('img');
        this.modalImage.className = 'modal-image';
        this.modalImage.src = imageSrc;
        this.modalImage.alt = 'Carta ampliada';

        // Crear la lupa
        this.magnifier = document.createElement('div');
        this.magnifier.className = 'magnifier';
        this.magnifier.style.display = 'none';
        this.magnifier.style.backgroundImage = `url(${imageSrc})`;

        // Crear botón de cerrar
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal-close';
        this.closeButton.setAttribute('aria-label', 'Cerrar modal');
        this.closeButton.innerHTML = '×';

        // Ensamblar el modal
        imageContainer.appendChild(this.modalImage);
        imageContainer.appendChild(this.magnifier);
        this.modalContent.appendChild(imageContainer);
        this.modalContent.appendChild(this.closeButton);
        this.modalOverlay.appendChild(this.modalContent);
        document.body.appendChild(this.modalOverlay);

        // Agregar event listeners
        this.addEventListeners();

        requestAnimationFrame(() => {
            this.modalOverlay.classList.add('fade-in');
            this.modalContent.classList.add('fade-in');
        });
    }

    addEventListeners() {
        this.closeButton.addEventListener('click', this.close);
        this.modalOverlay.addEventListener('click', this.handleOverlayClick);
        document.addEventListener('keydown', this.handleKeyPress);

        // Event listeners para la lupa
        this.modalImage.addEventListener('mousemove', this.handleMouseMove);
        this.modalImage.addEventListener('mouseenter', this.handleMouseEnter);
        this.modalImage.addEventListener('mouseleave', this.handleMouseLeave);
        this.modalImage.addEventListener('wheel', this.handleWheel);
    }

    removeEventListeners() {
        this.closeButton.removeEventListener('click', this.close);
        this.modalOverlay.removeEventListener('click', this.handleOverlayClick);
        document.removeEventListener('keydown', this.handleKeyPress);

        this.modalImage.removeEventListener('mousemove', this.handleMouseMove);
        this.modalImage.removeEventListener('mouseenter', this.handleMouseEnter);
        this.modalImage.removeEventListener('mouseleave', this.handleMouseLeave);
        this.modalImage.removeEventListener('wheel', this.handleWheel);
    }

    handleMouseMove(e) {
        const rect = this.modalImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calcular posición relativa (0-1)
        const xRelative = x / rect.width;
        const yRelative = y / rect.height;

        // Mover la lupa
        this.magnifier.style.left = `${x - this.magnifierSize/2}px`;
        this.magnifier.style.top = `${y - this.magnifierSize/2}px`;

        // Actualizar posición del background de la lupa
        const magnification = 2; // Factor de aumento
        const bgX = xRelative * 100;
        const bgY = yRelative * 100;
        this.magnifier.style.backgroundPosition = `${bgX}% ${bgY}%`;
        this.magnifier.style.backgroundSize = `${rect.width * magnification}px ${rect.height * magnification}px`;
    }

    handleMouseEnter() {
        this.magnifier.style.display = 'block';
    }

    handleMouseLeave() {
        this.magnifier.style.display = 'none';
    }

    handleWheel(e) {
        e.preventDefault();
        const magnification = e.deltaY > 0 ? -0.2 : 0.2;
        const newSize = this.magnifierSize + (magnification * 50);

        if (newSize >= 100 && newSize <= 300) {
            this.magnifierSize = newSize;
            this.magnifier.style.width = `${this.magnifierSize}px`;
            this.magnifier.style.height = `${this.magnifierSize}px`;
        }
    }

    handleOverlayClick(e) {
        if (e.target === this.modalOverlay) {
            this.close();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    close() {
        if (this.isAnimating) return;

        this.isAnimating = true;

        this.modalOverlay.classList.remove('fade-in');
        this.modalContent.classList.add('fade-out');

        setTimeout(() => {
            this.removeEventListeners();
            this.modalOverlay.remove();
            this.isAnimating = false;
        }, 300);
    }
}

// Card system variables
let originalCards = [];
let displayedCards = [];
const CARDS_PER_PAGE = 9;
let currentPage = 1;
const imageModal = new ImageModal();

let activeFilters = {
    name: '',
    attribute: '',
    level: '',
    subtype: '',
    priceRange: '',
    sortOrder: 'default'
};

async function loadCards() {
    try {
        const response = await fetch('imagenes/yu_gi_oh_detailed_cards.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        originalCards = Object.values(data)
            .flat()
            .filter(card => card.level !== undefined && card.level !== null);

        originalCards.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        displayedCards = [...originalCards];
        renderCurrentPage();
        setupPagination();
    } catch (error) {
        console.error('Error loading cards:', error);
        document.getElementById('cardsContainer').innerHTML =
            '<p class="error-message">Error cargando las cartas. Por favor, intenta más tarde.</p>';
    }
}

function calculatePrice(card) {
    if (!card) return 100;
    const basePrice = 100;
    if (!card.level) return basePrice;

    if (card.level <= 3) return 100;
    if (card.level <= 5) return 200;
    if (card.level <= 8) return 300;
    return 1000;
}

function isInLevelRange(cardLevel, levelRange) {
    if (!levelRange) return true;

    switch(levelRange) {
        case '1-3': return cardLevel >= 1 && cardLevel <= 3;
        case '4-5': return cardLevel >= 4 && cardLevel <= 5;
        case '6-8': return cardLevel >= 6 && cardLevel <= 8;
        case '10+': return cardLevel >= 10;
        default: return true;
    }
}

function isInPriceRange(cardPrice, priceRange) {
    if (!priceRange) return true;

    switch(priceRange) {
        case '0-100': return cardPrice <= 100;
        case '101-200': return cardPrice > 100 && cardPrice <= 200;
        case '201-300': return cardPrice > 200 && cardPrice <= 300;
        case '301-999': return cardPrice > 300 && cardPrice < 1000;
        case '1000': return cardPrice === 1000;
        default: return true;
    }
}

function applySorting() {
    if (activeFilters.sortOrder === 'default') {
        displayedCards.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    } else {
        const isAscending = activeFilters.sortOrder === 'asc';
        displayedCards.sort((a, b) => {
            const priceA = calculatePrice(a);
            const priceB = calculatePrice(b);
            return isAscending ? priceA - priceB : priceB - priceA;
        });
    }
}

function applyFilters() {
    displayedCards = [...originalCards];

    if (activeFilters.name) {
        displayedCards = displayedCards.filter(card =>
            card.name.toLowerCase().includes(activeFilters.name.toLowerCase())
        );
    }

    if (activeFilters.attribute) {
        displayedCards = displayedCards.filter(card =>
            card.attribute && card.attribute.toLowerCase() === activeFilters.attribute.toLowerCase()
        );
    }

    if (activeFilters.level) {
        displayedCards = displayedCards.filter(card =>
            isInLevelRange(card.level, activeFilters.level)
        );
    }

    if (activeFilters.subtype) {
        displayedCards = displayedCards.filter(card =>
            card.race && card.race.toLowerCase() === activeFilters.subtype.toLowerCase()
        );
    }

    if (activeFilters.priceRange) {
        displayedCards = displayedCards.filter(card =>
            isInPriceRange(calculatePrice(card), activeFilters.priceRange)
        );
    }

    applySorting();

    currentPage = 1;
    renderCurrentPage();
    setupPagination();
}

function setupFilterListeners() {
    const searchInput = document.querySelector('.filter-item input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.name = e.target.value.trim();
            applyFilters();
        });
    }

    const filterSelects = {
        'attribute': 'attribute',
        'level': 'level',
        'subtype': 'subtype',
        'price-range': 'priceRange'
    };

    Object.entries(filterSelects).forEach(([name, filterKey]) => {
        const select = document.querySelector(`select[name="${name}"]`);
        if (select) {
            select.addEventListener('change', (e) => {
                activeFilters[filterKey] = e.target.value;
                applyFilters();
            });
        }
    });

    const sortSelect = document.querySelector('select[name="sort-order"]');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeFilters.sortOrder = e.target.value;
            applyFilters();
        });
    }
}

function setupPagination() {
    const totalPages = Math.ceil(displayedCards.length / CARDS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            setupPagination();
        }
    };
    if (currentPage === 1) {
        prevButton.disabled = true;
    }
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        if (totalPages <= 7 ||
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.className = 'active';
            }
            pageButton.onclick = () => {
                currentPage = i;
                renderCurrentPage();
                setupPagination();
            };
            paginationContainer.appendChild(pageButton);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination-dots';
            paginationContainer.appendChild(dots);
        }
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            setupPagination();
        }
    };
    if (currentPage === totalPages) {
        nextButton.disabled = true;
    }
    paginationContainer.appendChild(nextButton);
}

function renderCurrentPage() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (displayedCards.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron cartas que coincidan con tu búsqueda.</p>';
        return;
    }

    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const cardsToShow = displayedCards.slice(startIndex, endIndex);

    cardsToShow.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';

        const price = calculatePrice(card);

        cardElement.innerHTML = `
            <img src="${card.image_url}" alt="${card.name}" 
                 loading="lazy"
                 onerror="this.src='images/card-back.jpg'"
                 class="card-image">
            <div class="card-info">
                <h4 class="card-name">${card.name}</h4>
                <p class="card-price">${price} PM</p>
                <button class="btn add-to-cart" 
                        onclick="addToCart('${card.name}', ${price})">
                    Agregar al Carrito
                </button>
            </div>
        `;

        // Add modal functionality to the card image
        const cardImage = cardElement.querySelector('img');
        cardImage.style.cursor = 'pointer';
        cardImage.addEventListener('click', () => {
            imageModal.create(card.image_url);
        });

        container.appendChild(cardElement);
    });
}

function addToCart(cardName, price) {
    alert(`${cardName} agregado al carrito - Precio: ${price} PM`);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    setupFilterListeners();
});

// Obtener el carrito desde localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Guardar el carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Agregar producto al carrito
function addToCart(cardName, price, image) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === cardName);

    if (existingItem) {
        existingItem.quantity += 1; // Incrementa la cantidad si ya existe
    } else {
        cart.push({
            name: cardName,
            price: price,
            image: image,
            quantity: 1
        });
    }

    saveCart(cart);
    alert(`${cardName} se agregó al carrito.`);
}

// Renderizar las cartas con el botón de "Agregar al carrito"
function renderCurrentPage() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (displayedCards.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron cartas que coincidan con tu búsqueda.</p>';
        return;
    }

    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const cardsToShow = displayedCards.slice(startIndex, endIndex);

    cardsToShow.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';

        const price = calculatePrice(card);

        cardElement.innerHTML = `
            <img src="${card.image_url}" alt="${card.name}" 
                 loading="lazy"
                 onerror="this.src='images/card-back.jpg'"
                 class="card-image">
            <div class="card-info">
                <h4 class="card-name">${card.name}</h4>
                <p class="card-price">${price} PM</p>
                <button class="btn add-to-cart" 
                        onclick="addToCart('${card.name}', ${price}, '${card.image_url}')">
                    Agregar al Carrito
                </button>
            </div>
        `;

        // Modal para visualizar la carta
        const cardImage = cardElement.querySelector('img');
        cardImage.style.cursor = 'pointer';
        cardImage.addEventListener('click', () => {
            imageModal.create(card.image_url);
        });

        container.appendChild(cardElement);
    });
}
