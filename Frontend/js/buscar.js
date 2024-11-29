document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("buscarform");
    const searchInput = document.getElementById("s");
    const resultsContainer = document.getElementById("search-results");
    const resultsList = document.getElementById("results-list");

   
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const query = searchInput.value.trim();
        if (!query) {
            return;
        }

        try {

            const response = await fetch(`http://localhost:3000/api/producto/letras/${query}`);
            if (!response.ok) throw new Error("Error al buscar productos.");

            const productos = await response.json();


            resultsList.innerHTML = "";

            if (productos.length === 0) {
                resultsList.innerHTML = "<li>No se encontraron productos.</li>";
            } else {
                
                productos.forEach((producto) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = producto.producto_nombre;
                    listItem.className = "result-item";

                    
                    listItem.addEventListener("click", () => {
                        const productoId = producto.id_prod;
                        window.location.href = `detalleProducto.html?id=${productoId}`;
                    });

                    resultsList.appendChild(listItem);
                });
            }

            
            resultsContainer.style.display = "block";
        } catch (error) {
            console.error("Error al buscar productos:", error);
            resultsList.innerHTML = "<li>Error al buscar productos.</li>";
        }
    });
});


