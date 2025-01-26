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

// Función para actualizar las noticias
function updateNews(cards) {
    const container = document.getElementById('news-container');
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
            <p>${card.name}</p>
            <p>${card.desc}</p>
        `;
        container.appendChild(newsItem);
    });
}

// Inicialización
async function initNewsUpdater() {
    const cards = await fetchCards(); // Carga las cartas del JSON
    if (cards) {
        updateNews(cards); // Muestra las primeras noticias

        // Cambia las noticias cada 15 segundos
        setInterval(() => updateNews(cards), 15000);
    }
}

// Ejecuta la inicialización cuando la página se carga
document.addEventListener('DOMContentLoaded', initNewsUpdater);
