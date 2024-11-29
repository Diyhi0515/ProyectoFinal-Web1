document.addEventListener("DOMContentLoaded", async () => {
    const carritoId = localStorage.getItem("carritoId");
    const userSesion = localStorage.getItem("userInSession");

    const userId = userSesion ? JSON.parse(userSesion).id : null;

    console.log(carritoId);
    console.log(userId);

    if (!carritoId) {
        alert("No hay un carrito activo.");
        window.location.href = "catalogo.html";
        return;
    }
    

    try {
        const carrito = await obtenerCarrito(carritoId);
        if (carrito.detalles.length === 0) {
            window.location.href = "catalogo.html";
            return;
        }

        if (userId) {
            const usuario = await obtenerUsuario(userId);
            completarCamposUsuario(usuario);
        }

        await cargarProductosEnPagina(carrito);
        configurarBotonCompra(carritoId, userId);
    } catch (error) {
        console.error("Error al cargar los datos del carrito:", error);
        alert("Hubo un problema al cargar el pedido. Inténtalo nuevamente.");
    }
});


async function obtenerUsuario(userId) {
    const response = await fetch(`http://localhost:3000/api/usuario/${userId}`);
    if (!response.ok) throw new Error("Error al obtener los datos del usuario.");
    return await response.json();
}

function completarCamposUsuario(usuario) {

    const razonSocialInput = document.getElementById("razon-social");
    if (usuario.nit_ci) {
        razonSocialInput.value = usuario.nit_ci;
    }


    const telefonoInput = document.getElementById("telefono");
    if (usuario.celular) {
        telefonoInput.value = usuario.celular;
    }

    const direccionInput = document.getElementById("direccion");
    if (usuario.direccion && usuario.direccion.direccion) {
        direccionInput.value = usuario.direccion.direccion;
    }
}


async function obtenerCarrito(carritoId) {
    const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`);
    if (!response.ok) throw new Error("Error al obtener el carrito.");
    return await response.json();
}

async function cargarProductosEnPagina(carrito) {
    const contenedorProductos = document.querySelector(".productos-enviar");
    contenedorProductos.innerHTML = "<h2>Productos a Enviar</h2>";

    let total = 0;

    for (const detalle of carrito.detalles) {
        try {
            const producto = await obtenerDetallesProducto(detalle.producto_id);
            total += producto.precio * detalle.cantidad;

            const productoHTML = `
                <div class="producto">
                    <img src="http://localhost:3000/api/imagen/${producto.imagen_id}" alt="${producto.producto_nombre}">
                    <div class="detalles">
                        <p>${producto.producto_nombre}</p>
                        <p>Cantidad: ${detalle.cantidad}</p>
                        <p>Bs ${producto.precio}</p>
                    </div>
                    <div class="total-productocantidad">
                        <p><strong>Bs ${producto.precio * detalle.cantidad}</strong></p>
                    </div>
                </div>
            `;
            contenedorProductos.innerHTML += productoHTML;
        } catch (error) {
            console.error(`Error al obtener los detalles del producto ID ${detalle.producto_id}:`, error);
        }
    }

    document.querySelector(".resumen-pago").innerHTML = `
        <h2>Resumen de Pago</h2>
        <p>Subtotal: Bs ${total}</p>
        <p>Total: Bs ${total}</p>
    `;
}


async function obtenerDetallesProducto(productoId) {
    const response = await fetch(`http://localhost:3000/api/producto/${productoId}`);
    if (!response.ok) throw new Error(`Error al obtener el producto con ID ${productoId}.`);
    return await response.json();
}



function configurarBotonCompra(carritoId, userId) {
    const btnComprar = document.querySelector(".realizar-compra");
    btnComprar.addEventListener("click", async () => {
        if (userId) {
            try {
                const response = await fetch(`http://localhost:3000/api/pedido/${carritoId}/${userId}`, {
                    method: "POST",
                });
                if (!response.ok) throw new Error("Error al realizar el pedido.");
                localStorage.removeItem("carritoId");
                window.location.href = "pedidos.html";
            } catch (error) {
                console.error("Error al realizar la compra:", error);
            }
        } else {
            window.location.href = "login.html";
        }
    });

    const btnCancelar = document.querySelector(".cancelar-pedido");
    btnCancelar.addEventListener("click", async () => {
        if (confirm("¿Estás seguro de que deseas cancelar el pedido?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Error al cancelar el pedido.");
                
                localStorage.removeItem("carritoId"); 
                window.location.href = "catalogo.html";
            } catch (error) {
                console.error("Error al cancelar el pedido:", error);
            }
        }
    });
}
