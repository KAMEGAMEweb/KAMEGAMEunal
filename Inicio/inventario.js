// Obtener el inventario desde localStorage
function getInventory() {
    const inventory = localStorage.getItem('inventory');
    return inventory ? JSON.parse(inventory) : [];
}

// Renderizar las cartas del inventario
function renderInventory(filter = '') {
    const inventory = getInventory();
    const inventoryGrid = document.getElementById('inventory-grid');

    inventoryGrid.innerHTML = '';

    // Filtrar cartas por el término de búsqueda
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredInventory.length === 0) {
        inventoryGrid.innerHTML = '<p class="no-results">No se encontraron cartas con ese nombre.</p>';
        return;
    }

    filteredInventory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p>Cantidad: ${item.quantity}</p>
        `;
        inventoryGrid.appendChild(card);
    });
}

// Configurar el buscador
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Buscar al presionar el botón
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        renderInventory(searchTerm);
    });

    // Buscar al escribir en tiempo real
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        renderInventory(searchTerm);
    });
}

// Inicializar inventario al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
    setupSearch();
});
