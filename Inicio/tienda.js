// tienda.js

let allCards = []; // Variable global para almacenar todas las cartas
const CARDS_PER_PAGE = 10; // Número de cartas por página
let currentPage = 1; // Página actual

// Función para cargar el JSON
async function loadCards() {
    try {
        const response = await fetch('imagenes/yu_gi_oh_detailed_cards.json');
        const data = await response.json();
        allCards = Object.values(data).flat();
        renderCurrentPage();
        setupPagination();
    } catch (error) {
        console.error('Error cargando las cartas:', error);
    }
}

// Función para calcular el precio
function calculatePrice(card) {
    let basePrice = 100;
    if (!card.level) return basePrice;

    if (card.level <= 3) return 100;
    if (card.level <= 5) return 200;
    if (card.level <= 8) return 300;
    return 1000;
}

// Función para renderizar la página actual
function renderCurrentPage() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = ''; // Limpiar el contenedor

    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const cardsToShow = allCards.slice(startIndex, endIndex);

    cardsToShow.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        const price = calculatePrice(card);

        cardElement.innerHTML = `
            <img src="${card.image_url}" alt="${card.name}" 
                 onerror="this.src='images/card-back.jpg'">
            <div class="card-info">
                <h4 class="card-name">${card.name}</h4>
                ${card.level ? `<p class="card-level">Nivel ${card.level}</p>` : ''}
                ${card.type ? `<p class="card-type">${card.type}</p>` : ''}
                ${card.attribute ? `<p class="card-attribute">${card.attribute}</p>` : ''}
                <p class="card-price">${price} PM</p>
                <button class="btn" onclick="addToCart('${card.name}', ${price})">
                    Agregar al Carrito
                </button>
            </div>
        `;

        container.appendChild(cardElement);
    });
}

// Función para configurar la paginación
// Función para configurar la paginación
function setupPagination() {
    const totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');
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

    // Determinar qué números de página mostrar
    let pagesToShow = [];
    const maxVisiblePages = 5; // Número máximo de páginas a mostrar

    if (totalPages <= maxVisiblePages) {
        // Si hay pocas páginas, mostrar todas
        pagesToShow = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        // Siempre mostrar la primera página
        pagesToShow.push(1);

        // Calcular el rango de páginas alrededor de la página actual
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Ajustar si estamos cerca del inicio o final
        if (currentPage <= 2) {
            end = 4;
        }
        if (currentPage >= totalPages - 1) {
            start = totalPages - 3;
        }

        // Agregar el rango de páginas
        for (let i = start; i <= end; i++) {
            pagesToShow.push(i);
        }

        // Siempre mostrar la última página
        if (!pagesToShow.includes(totalPages)) {
            pagesToShow.push(totalPages);
        }
    }

    // Crear los botones de página
    pagesToShow.forEach(pageNum => {
        const pageButton = document.createElement('button');
        pageButton.textContent = pageNum;
        if (pageNum === currentPage) {
            pageButton.className = 'active';
        }
        pageButton.onclick = () => {
            currentPage = pageNum;
            renderCurrentPage();
            setupPagination();
        };
        paginationContainer.appendChild(pageButton);
    });

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

// Función de filtrado
function filterCards(searchTerm = '') {
    allCards = allCards.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    currentPage = 1;
    renderCurrentPage();
    setupPagination();
}

// Función para agregar al carrito
function addToCart(cardName, price) {
    console.log(`Agregando ${cardName} al carrito - Precio: ${price} PM`);
    alert(`${cardName} agregado al carrito`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCards();

    const searchInput = document.querySelector('.filter-item input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterCards(e.target.value);
        });
    }
});