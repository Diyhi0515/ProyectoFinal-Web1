async function cargarPedidos() {
    try {
        const response = await fetch('http://localhost:3000/api/pedido');
        const pedidos = await response.json();

        const pedidoLista = document.getElementById('pedido-lista');
        pedidoLista.innerHTML = ''; 

        pedidos.forEach(pedido => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${pedido.pedido_id}</td>
                <td>${pedido.cliente_nombre}</td>
                <td>${new Date(pedido.pedido_fecha).toLocaleDateString()}</td>
                <td>
                    <p class="${estadoClase(pedido.carrito_estado)}">${pedido.carrito_estado}</p>
                </td>
                <td>
                    <ul>
                        ${pedido.detalles.map(item => `
                            <li>${item.producto_nombre} (x${item.cantidad})</li>
                        `).join('')}
                    </ul>
                </td>
                <td>$${pedido.total_pago}</td>
            `;
            pedidoLista.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}


function estadoClase(estado) {
    switch (estado.toLowerCase()) {
        case 'en proceso':
            return 'estado-en-proceso';
        case 'confirmado':
            return 'estado-enviado';
        default:
            return 'estado-desconocido';
    }
}


document.addEventListener('DOMContentLoaded', cargarPedidos);