document.addEventListener("DOMContentLoaded", async () => {
    const userSesion = localStorage.getItem("userInSession");
    const userId = userSesion ? JSON.parse(userSesion).id : null;

    if (!userId) {
        window.location.href = "catalogo.html";
        return;
    }

    try {
        const pedidosResponse = await fetch(`http://localhost:3000/api/pedido/cliente/${userId}`);
        const pedidos = await pedidosResponse.json();

        console.log(pedidos);

        if (pedidos.length === 0) {
            alert("No tienes pedidos registrados. Redirigiendo al catálogo...");
            window.location.href = "catalogo.html";
            return;
        }

        const pedidosContainer = document.querySelector("tbody");

        for (const pedido of pedidos) {
            const detalles = await Promise.all(
                pedido.detalles.map(async (detalle) => {
                    const productoResponse = await fetch(`http://localhost:3000/api/producto/${detalle.producto_id}`);
                    const producto = await productoResponse.json();
                    return {
                        ...detalle,
                        nombreProducto: producto.producto_nombre,
                    };
                })
            );

            const pedidoRow = document.createElement("tr");

            pedidoRow.innerHTML = `
                <td>${new Date(pedido.pedido_fecha).toLocaleDateString()}</td>
                <td>
                    ${detalles.map(detalle => `<p>${detalle.nombreProducto} (x${detalle.cantidad})</p>`).join("")}
                </td>
                <td>
                    ${getEstadoHtml(pedido.carrito_estado)}
                </td>
                <td>$${pedido.total_pago}</td>
            `;

            pedidosContainer.appendChild(pedidoRow);
        }
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
    }
});

function getEstadoHtml(estado) {
    let claseEstado;
    switch (estado.toLowerCase()) {
        case "por entregar":
            claseEstado = "estado-pendiente";
            break;
        case "en proceso":
            claseEstado = "estado-en-proceso";
            break;
        case "enviado":
            claseEstado = "estado-enviado";
            break;
        default:
            claseEstado = "estado-desconocido";
    }
    return `<p class="${claseEstado}">${estado}</p>`;
}
