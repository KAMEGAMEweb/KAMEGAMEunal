// Obtener el carrito desde localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Guardar el carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Mostrar los productos en el carrito
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cart = getCart();

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>El carrito está vacío</p>';
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'item';

        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <p class="product-name">${item.name}</p>
            </div>
            <div class="quantity">
                <button onclick="decreaseQuantity(${index})">-</button>
                <input type="text" value="${item.quantity}" readonly>
                <button onclick="increaseQuantity(${index})">+</button>
            </div>
            <p class="price">$${item.price.toFixed(2)}</p>
            <button class="btn-remove" onclick="removeItem(${index})">Eliminar</button>
        `;
        cartItems.appendChild(cartItem);
    });

    updateTotal();
}

// Actualizar el total del carrito
function updateTotal() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const summary = document.querySelector('.summary p strong');
    if (summary) {
        summary.textContent = `Total: $${total.toFixed(2)}`;
    }
}

// Incrementar la cantidad de un producto
function increaseQuantity(index) {
    const cart = getCart();
    cart[index].quantity += 1;
    saveCart(cart);
    renderCart();
    updateSummary(); // Actualizar el resumen después del cambio
}

// Reducir la cantidad de un producto
function decreaseQuantity(index) {
    const cart = getCart();
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart(cart);
        renderCart();
        updateSummary(); // Actualizar el resumen después del cambio
    }
}

// Eliminar un producto del carrito
function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1); // Elimina el producto del array
    saveCart(cart);
    renderCart();
    updateSummary(); // Actualizar el resumen después de la eliminación
}

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

// Actualizar el resumen de compra
function updateSummary() {
    const cart = getCart();
    const summaryList = document.getElementById('summary-list');
    const totalPriceElement = document.getElementById('total-price');

    summaryList.innerHTML = ''; // Limpia el contenido actual
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        // Crear un elemento para mostrar el producto en el resumen
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (x${item.quantity}) - $${itemTotal.toFixed(2)}`;
        summaryList.appendChild(listItem);
    });

    // Actualizar el precio total
    totalPriceElement.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;
}

// Procesar la compra
function buyAll() {
    const cart = getCart();

    if (cart.length === 0) {
        alert('El carrito está vacío. Agrega productos antes de comprar.');
        return;
    }

    // Simular la compra
    alert(`¡Gracias por tu compra! Has pagado $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}.`);
    
    // Vaciar el carrito después de la compra
    saveCart([]);
    renderCart();
    updateSummary();
}

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateSummary();
});
