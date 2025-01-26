
document.addEventListener("DOMContentLoaded", () => {
    fetch("yu_gi_oh_detailed_cards.json")
        .then(response => response.json())
        .then(data => {
            const noticiasContainer = document.getElementById("noticiasContainer");
            const cartas = data["Effect Monster"].slice(0, 6); // Limitar a 6 noticias

            cartas.forEach(carta => {
                const noticia = document.createElement("div");
                noticia.className = "noticia-item";

                noticia.innerHTML = `
                    <img src="${carta.image_url}" alt="${carta.name}">
                    <h3>${carta.name}</h3>
                    <p>${carta.desc.substring(0, 100)}...</p>
                `;

                noticiasContainer.appendChild(noticia);
            });
        })
        .catch(error => {
            console.error("Error al cargar las noticias:", error);
            document.getElementById("noticiasContainer").innerHTML = "<p>Error al cargar las noticias.</p>";
        });
});
