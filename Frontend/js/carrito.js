document.addEventListener("DOMContentLoaded", async () => {
    const carritoId = localStorage.getItem("carritoId");

    

    console.log(carritoId);
    if (!carritoId) {
        window.location.href = "catalogo.html";
        return;
    }
    try {
        const carrito = await obtenerCarrito(carritoId);
        console.log(carrito);
        const titulo = document.querySelector(".titulo-carrito span");
        titulo.textContent = "(" + carrito.importe_productos + " producto/s)";
        await renderCarrito(carrito);
        agregarEventoComprar(); 
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
    }
});



async function obtenerCarrito(carritoId) {
    const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`);

    if (!response.ok) throw new Error("Error al obtener el carrito.");
    return await response.json();
}

async function obtenerDetallesProducto(productoId) {
    const response = await fetch(`http://localhost:3000/api/producto/${productoId}`);
    if (!response.ok) throw new Error(`Error al obtener el producto con ID: ${productoId}`);
    return await response.json();
}

async function actualizarCantidad(carritoId, productoId, accion) {
    const endpoint = accion === "incrementar" 
        ? `http://localhost:3000/api/carrito/sumar/${carritoId}/${productoId}` 
        : `http://localhost:3000/api/carrito/restar/${carritoId}/${productoId}`;
    const response = await fetch(endpoint, { method: "PUT" });
    if (!response.ok) throw new Error(`Error al ${accion} cantidad del producto.`);
}


async function eliminarProducto(carritoId, productoId) {
    const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}/${productoId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Error al eliminar el producto.");
}
function agregarEventoComprar() {
    const btnComprar = document.querySelector(".btn-comprar");
    btnComprar.addEventListener("click", () => {
        const carritoId = localStorage.getItem("carritoId");
        if (carritoId) {
            window.location.href = "registrarPedido.html";
        }
    });
}


async function renderCarrito(carrito) {
    const tbody = document.querySelector(".carrito-table tbody");
    tbody.innerHTML = ""; 
    const btnComprar = document.querySelector(".btn-comprar");

    

    if (carrito.detalles.length === 0) {
        btnComprar.style.display = "none";  
        window.location.href = "catalogo.html";
        return;
    } else {
        btnComprar.style.display = "inline-block"; 
    }

    for (const detalle of carrito.detalles) {
        try {
            const producto = await obtenerDetallesProducto(detalle.producto_id);
            const fila = document.createElement("tr");
            fila.dataset.productoId = detalle.producto_id; 
            fila.innerHTML = `
                <td>
                    <div class="producto-info">
                        <img src="http://localhost:3000/api/imagen/${producto.imagen_id}" alt="${producto.producto_nombre}">
                    </div>
                </td>
                <td><p>${producto.producto_nombre}</p></td>
                <td class="precio-individual">Bs ${producto.precio}</td>
                <td>
                    <div class="cantidad">
                        <button 
                            class="cantidad-btn" 
                            data-action="decrementar" 
                            style="display: ${detalle.cantidad > 1 ? "inline-block" : "none"};"> 
                            - 
                        </button>
                        <input type="number" value="${detalle.cantidad}" min="1" class="cantidad-input" readonly>
                        <button class="cantidad-btn" data-action="incrementar">+</button>
                    </div>
                </td>
                <td class="total-fila">Bs ${detalle.cantidad * producto.precio}</td>
                <td>
                    <button class="eliminar-btn"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        } catch (error) {
            console.error(`Error al cargar los detalles del producto con ID: ${detalle.producto_id}`, error);
        }
    }

    document.querySelector(".resumen span").textContent = `Bs ${carrito.total_pago}`;
    document.querySelector(".total-carrito").textContent = `Bs ${carrito.total_pago}`;

   
    asignarEventosBotones(carrito.transaccion_id);
}


function asignarEventosBotones(carritoId) {
    const tbody = document.querySelector(".carrito-table tbody");

    const carritoCount = document.getElementById("carrito-count");

    tbody.addEventListener("click", async (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        const action = button.dataset.action;
        const fila = button.closest("tr");
        const productoId = fila.dataset.productoId;

        try {
            if (action === "incrementar" || action === "decrementar") {
                await actualizarCantidad(carritoId, productoId, action);

                const detalleActualizado = await obtenerDetallesProducto(productoId);
                const cantidadInput = fila.querySelector(".cantidad-input");
                const precioIndividual = fila.querySelector(".precio-individual");
                const totalFila = fila.querySelector(".total-fila");

                const nuevaCantidad = action === "incrementar" 
                    ? parseInt(cantidadInput.value) + 1 
                    : parseInt(cantidadInput.value) - 1;

                cantidadInput.value = nuevaCantidad;
                totalFila.textContent = `Bs ${nuevaCantidad * detalleActualizado.precio}`;
                precioIndividual.textContent = `Bs ${detalleActualizado.precio}`;

                const decrementarBtn = fila.querySelector('[data-action="decrementar"]');
                decrementarBtn.style.display = nuevaCantidad > 1 ? "inline-block" : "none";
            } else if (button.classList.contains("eliminar-btn")) {
                await eliminarProducto(carritoId, productoId);
                fila.remove();
            }


            const carritoExiste = await verificarCarrito(carritoId);
            if (!carritoExiste) {
                localStorage.removeItem("carritoId");
                window.location.href = "catalogo.html";
            }

            const carrito = await obtenerCarrito(carritoId);
            document.querySelector(".resumen span").textContent = `Bs ${carrito.total_pago}`;
            document.querySelector(".total-carrito").textContent = `Bs ${carrito.total_pago}`;

            if (carrito.importe_productos && carrito.importe_productos > 0) {
                console.log(carrito.importe_productos);
                carritoCount.textContent = carrito.importe_productos;
                carritoCount.style.display = "inline-block";
            } else {
                carritoCount.style.display = "none";
            }
        } catch (error) {
            console.error(`Error al procesar la acción: ${action || "eliminar"}`, error);
        }
    });
}


async function verificarCarrito(carritoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error al verificar el carrito:", error);
        return null;
    }
}
