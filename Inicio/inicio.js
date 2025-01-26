// Lista de mensajes aleatorios
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

// Función para actualizar las noticias con animación
function updateNewsWithAnimation(cards) {
    const container = document.getElementById('news-container');

    // Añade la clase de fade-out
    container.classList.add('fade-out');

    // Espera a que termine la animación de fade-out
    setTimeout(() => {
        container.innerHTML = ''; // Limpia el contenido actual

        // Selección aleatoria de 3 cartas
        const randomCards = cards['Effect Monster']
            .sort(() => 0.5 - Math.random()) // Mezcla aleatoria
            .slice(0, 3); // Selecciona las primeras 3

        // Genera el HTML de las noticias
        randomCards.forEach(card => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <img src="${card.image_url}" alt="${card.name}">
                <p>${getRandomMessage()}</p>
            `;
            container.appendChild(newsItem);
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

// Inicialización
async function initNewsUpdater() {
    const cards = await fetchCards(); // Carga las cartas del JSON
    if (cards) {
        updateNewsWithAnimation(cards); // Muestra las primeras noticias

        // Cambia las noticias cada 30 segundos con animación
        setInterval(() => updateNewsWithAnimation(cards), 30000);
    }
}

// Ejecuta la inicialización cuando la página se carga
document.addEventListener('DOMContentLoaded', initNewsUpdater);
