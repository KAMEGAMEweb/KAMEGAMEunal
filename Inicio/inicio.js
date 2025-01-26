// Lista de mensajes para la sección de noticias
const messages = [
    "¡Mira la nueva carta!",
    "¡Esta carta espera por ti!",
    "¡Hazla parte de tu colección!",
    "¡Descubre sus habilidades!",
    "¡Llena tu inventario con esta carta!",
    "¡Prepárate para el duelo con esta carta!"
];

// Función para obtener un mensaje aleatorio
function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

// Fetch de los datos del JSON
async function fetchCards() {
    try {
        const response = await fetch('imagenes/yu_gi_oh_detailed_cards.json'); // Ruta del archivo JSON
        return await response.json();
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        return null;
    }
}

// Función para actualizar la sección con animación (aplicada a noticias o tienda)
function updateSectionWithAnimation(containerId, cards, filterFn, generateHTMLFn) {
    const container = document.getElementById(containerId);

    // Añade la clase de fade-out
    container.classList.add('fade-out');

    // Espera a que termine la animación de fade-out
    setTimeout(() => {
        container.innerHTML = ''; // Limpia el contenido actual

        // Filtra y selecciona aleatoriamente las cartas
        const filteredCards = cards['Effect Monster'].filter(filterFn)
            .sort(() => 0.5 - Math.random()) // Mezcla aleatoria
            .slice(0, 4); // Selecciona las primeras 3

        // Genera el HTML de cada carta
        filteredCards.forEach(card => {
            const itemHTML = generateHTMLFn(card);
            container.appendChild(itemHTML);
        });

        // Añade la clase de fade-in después de limpiar
        container.classList.remove('fade-out');
        container.classList.add('fade-in');

        // Elimina la clase de fade-in después de la animación
        setTimeout(() => {
            container.classList.remove('fade-in');
        }, 1000); // Duración de la animación en milisegundos
    }, 1000); // Duración del fade-out
}

// Genera el HTML para una carta en la sección de noticias
function generateNewsHTML(card) {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
        <img src="${card.image_url}" alt="${card.name}">
        <p>${getRandomMessage()}</p>
    `;
    return newsItem;
}

// Genera el HTML para una carta en la sección de tienda
function generateShopHTML(card) {
    const shopItem = document.createElement('div');
    shopItem.className = 'shop-item';
    shopItem.innerHTML = `
        <img src="${card.image_url}" alt="${card.name}">
        <button class="shop-button" onclick="goToShop()">Ir a la tienda</button>
    `;
    return shopItem;
}

// Función para redirigir a tienda.html
function goToShop() {
    window.location.href = 'tienda.html';
}

// Inicialización de la sección de noticias
async function initNewsSection() {
    const cards = await fetchCards();
    if (cards) {
        updateSectionWithAnimation('news-container', cards, () => true, generateNewsHTML);
        setInterval(() => updateSectionWithAnimation('news-container', cards, () => true, generateNewsHTML), 30000);
    }
}

// Inicialización de la sección de tienda
async function initShopSection() {
    const cards = await fetchCards();
    if (cards) {
        updateSectionWithAnimation(
            'shop-container',
            cards,
            card => card.atk !== null || card.def !== null, // Filtra cartas con atk o def definidos
            generateShopHTML
        );
        setInterval(() => updateSectionWithAnimation('shop-container', cards, 
            card => card.atk !== null || card.def !== null, generateShopHTML), 30000);
    }
}

// Ejecuta las inicializaciones cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    initNewsSection();
    initShopSection();
});
