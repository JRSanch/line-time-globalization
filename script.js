// Animación inicial con GSAP
gsap.from('.container', {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: "power2.out"
});

// Cargar eventos desde el archivo JSON
fetch('events.json')
    .then(response => response.json())
    .then(data => {
        // Contador para eventos duplicados en 1947, 2023, 2024
        let count2023 = 0;
        let count2024 = 0;
        let count1947 = 0;

        data.forEach((event, index) => {
            // Alternar entre izquierda y derecha
            const positionClass = index % 2 === 0 ? 'left' : 'right';

            // Determinar el nombre de la imagen
            let imageName;
            if (event.year === 2023) {
                count2023++;
                imageName = count2023 === 1 ? '2023.jpg' : '2023_1.jpg';
            } else if (event.year === 2024) {
                count2024++;
                imageName = count2024 === 1 ? '2024.jpg' : '2024_1.jpg';
            } else if (event.year === 1947) {
                    count1947++;
                    imageName = count1947 === 1 ? '1947.jpg' : '1947_1.jpg';
            } else {
                imageName = `${event.year}.jpg`;
            }

            // Crear el HTML del evento con la imagen correspondiente
            const eventHTML = `
                <div class="container ${positionClass}" data-theme="${event.theme}" data-year="${event.year}">
                    <div class="content">
                        <h2>${event.year}</h2>
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                    </div>
                    <img src="./assets/${imageName}" alt="${event.title}" class="event-image">
                </div>
            `;
            document.querySelector('.timeline').innerHTML += eventHTML;
        });

        // Inicializar el mapa después de cargar los eventos
        initMap(data);
    });

// Filtrado por décadas
document.querySelectorAll('.filters button[data-decade]').forEach(button => {
    button.addEventListener('click', () => {
        const decade = parseInt(button.getAttribute('data-decade')); // Obtener la década (ej: 1920)
        const startYear = decade; // Año inicial de la década (ej: 1920)
        const endYear = decade + 9; // Año final de la década (ej: 1929)

        document.querySelectorAll('.container').forEach((container, index) => {
            const year = parseInt(container.getAttribute('data-year')); // Obtener el año del evento
            if (year >= startYear && year <= endYear) {
                container.style.display = 'flex'; // Mostrar si está en la década
                // Restaurar la clase left o right según la posición
                if (index % 2 === 0) {
                    container.classList.add('left');
                    container.classList.remove('right');
                } else {
                    container.classList.add('right');
                    container.classList.remove('left');
                }
            } else {
                container.style.display = 'none'; // Ocultar si no está en la década
            }
        });
    });
});

// Filtrado por temas
document.querySelectorAll('.filters button[data-theme]').forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        document.querySelectorAll('.container').forEach((container, index) => {
            const eventTheme = container.getAttribute('data-theme');
            if (eventTheme === theme) {
                container.style.display = 'flex'; // Mostrar si coincide con el tema
                // Restaurar la clase left o right según la posición
                if (index % 2 === 0) {
                    container.classList.add('left');
                    container.classList.remove('right');
                } else {
                    container.classList.add('right');
                    container.classList.remove('left');
                }
            } else {
                container.style.display = 'none'; // Ocultar si no coincide con el tema
            }
        });
    });
});

// Búsqueda de eventos
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.container').forEach((container, index) => {
        const text = container.textContent.toLowerCase();
        if (text.includes(query)) {
            container.style.display = 'flex'; // Mostrar si coincide con la búsqueda
            // Restaurar la clase left o right según la posición
            if (index % 2 === 0) {
                container.classList.add('left');
                container.classList.remove('right');
            } else {
                container.classList.add('right');
                container.classList.remove('left');
            }
        } else {
            container.style.display = 'none'; // Ocultar si no coincide con la búsqueda
        }
    });
});

// Inicializar el mapa con Leaflet
function initMap(events) {
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Agregar marcadores para eventos con coordenadas
    events.forEach(event => {
        if (event.coords) {
            L.marker(event.coords).addTo(map)
                .bindPopup(`<b>${event.title}</b><br>${event.description}`);
        }
    });
}

// Exportar a PDF mejorado
document.getElementById('export-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Capturar la línea del tiempo
    const timelineCanvas = await html2canvas(document.querySelector('.timeline'));
    const timelineImgData = timelineCanvas.toDataURL('image/png');
    pdf.addImage(timelineImgData, 'PNG', 10, 10, 190, 0);

    // Capturar el cuadro comparativo
    const tableCanvas = await html2canvas(document.querySelector('#cuadro-comparativo'));
    const tableImgData = tableCanvas.toDataURL('image/png');
    pdf.addPage();
    pdf.addImage(tableImgData, 'PNG', 10, 10, 190, 0);

    // Guardar el PDF
    pdf.save('linea-del-tiempo-y-cuadro-comparativo.pdf');
});

// Exportar línea del tiempo a PNG
document.getElementById('export-timeline-png').addEventListener('click', async () => {
    const timelineCanvas = await html2canvas(document.querySelector('.timeline'));
    const link = document.createElement('a');
    link.href = timelineCanvas.toDataURL('image/png');
    link.download = 'linea-del-tiempo.png';
    link.click();
});

// Exportar cuadro comparativo a PNG
document.getElementById('export-table-png').addEventListener('click', async () => {
    const tableCanvas = await html2canvas(document.querySelector('#cuadro-comparativo'));
    const link = document.createElement('a');
    link.href = tableCanvas.toDataURL('image/png');
    link.download = 'cuadro-comparativo.png';
    link.click();
});

// Función extra: Mostrar todos los eventos al hacer clic en "Mostrar Todo"
document.getElementById('show-all').addEventListener('click', () => {
    document.querySelectorAll('.container').forEach((container, index) => {
        container.style.display = 'flex'; // Mostrar todos los eventos
        // Restaurar la clase left o right según la posición
        if (index % 2 === 0) {
            container.classList.add('left');
            container.classList.remove('right');
        } else {
            container.classList.add('right');
            container.classList.remove('left');
        }
    });
});

// script.js
document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        row.addEventListener("click", () => {
            rows.forEach(r => r.classList.remove("highlight"));
            row.classList.add("highlight");
        });
    });
});


// Inicializar el Carrusel con JavaScript
$(document).ready(function () {
    $('.galeria-presidentes').slick({
        dots: true, // Muestra puntos de navegación
        infinite: true, // Desplazamiento infinito
        speed: 300, // Velocidad de transición
        slidesToShow: 5, // Número de imágenes visibles a la vez
        slidesToScroll: 1, // Número de imágenes a desplazar
        autoplay: true, // Reproducción automática
        autoplaySpeed: 2000, // Velocidad de reproducción automática
        responsive: [
            {
                breakpoint: 1024, // Ajustes para pantallas más pequeñas
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 600, // Ajustes para pantallas móviles
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    });
});

