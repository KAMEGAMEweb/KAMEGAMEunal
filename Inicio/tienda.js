let originalCards = [];
let displayedCards = [];
const CARDS_PER_PAGE = 8;
let currentPage = 1;

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
        // Filtrar solo cartas con nivel
        originalCards = Object.values(data)
            .flat()
            .filter(card => card.level !== undefined && card.level !== null);

        // Ordenar alfabéticamente por defecto
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
        // Ordenar alfabéticamente
        displayedCards.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    } else {
        // Ordenar por precio
        const isAscending = activeFilters.sortOrder === 'asc';
        displayedCards.sort((a, b) => {
            const priceA = calculatePrice(a);
            const priceB = calculatePrice(b);
            return isAscending ? priceA - priceB : priceB - priceA;
        });
    }
}

function applyFilters() {
    // Comenzamos con todas las cartas
    displayedCards = [...originalCards];

    // Aplicamos cada filtro por separado si está activo
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

    // Filtro por rango de precio
    if (activeFilters.priceRange) {
        displayedCards = displayedCards.filter(card =>
            isInPriceRange(calculatePrice(card), activeFilters.priceRange)
        );
    }

    // Aplicar ordenamiento
    applySorting();

    currentPage = 1;
    renderCurrentPage();
    setupPagination();
}

function setupFilterListeners() {
    // Búsqueda por nombre
    const searchInput = document.querySelector('.filter-item input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.name = e.target.value.trim();
            applyFilters();
        });
    }

    // Filtros de selección
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

    // Ordenamiento
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

    // Botón "Anterior"
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

    // Números de página
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

    // Botón "Siguiente"
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
                ${card.level ? `<p class="card-level">Nivel ${card.level}</p>` : ''}
                <p class="card-price">${price} PM</p>
                <button class="btn add-to-cart" 
                        onclick="addToCart('${card.name}', ${price})">
                    Agregar al Carrito
                </button>
            </div>
        `;

        container.appendChild(cardElement);
    });
}

function addToCart(cardName, price) {
    alert(`${cardName} agregado al carrito - Precio: ${price} PM`);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCards();
    setupFilterListeners();
});