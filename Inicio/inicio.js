// Fetch de los datos del JSON y renderizado de las cartas en el contenedor
async function loadNews() {
    try {
        const response = await fetch('imagenes/yu_gi_oh_detailed_cards.json'); // Asegúrate de que la ruta sea correcta
        const data = await response.json();

        // Selección aleatoria de elementos
        const randomCards = data['Effect Monster']
            .sort(() => 0.5 - Math.random()) // Mezcla aleatoria
            .slice(0, 3); // Toma los primeros 3 elementos

        const container = document.getElementById('news-container');

        // Genera el HTML para cada carta
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
    } catch (error) {
        console.error('Error al cargar las noticias:', error);
    }
}

// Ejecuta la función al cargar la página
document.addEventListener('DOMContentLoaded', loadNews);
