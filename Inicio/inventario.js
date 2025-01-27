// Obtener el inventario desde localStorage
function getInventory() {
    const inventory = localStorage.getItem('inventory');
    return inventory ? JSON.parse(inventory) : [];
}

// Renderizar las cartas del inventario
function renderInventory() {
    const inventory = getInventory();
    const inventoryGrid = document.getElementById('inventory-grid');

    inventoryGrid.innerHTML = '';

    if (inventory.length === 0) {
        inventoryGrid.innerHTML = '<p class="no-results">Tu inventario está vacío.</p>';
        return;
    }

    inventory.forEach(item => {
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

// Inicializar inventario al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
});
