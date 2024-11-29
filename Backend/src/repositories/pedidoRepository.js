const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}

const getPedidos = async () => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT 
            p.id AS pedido_id, 
            p.cliente_id AS cliente_id, 
            p.fecha AS pedido_fecha, 
            p.estado AS pedido_estado, 
            c.transaccion_id AS carrito_id, 
            c.importe_productos, 
            c.total_pago, 
            c.estado AS carrito_estado,
            d.item, 
            d.producto_id, 
            d.cantidad, 
            d.precio_unitario, 
            d.subtotal,
            u.nombre || ' ' || u.ap_paterno || ' ' || u.ap_materno AS cliente_nombre,
            pr.nombre AS producto_nombre -- Se agrega el nombre del producto
        FROM pedido p
        JOIN carrito c ON p.carrito_id = c.transaccion_id
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        JOIN usuario u ON p.cliente_id = u.id
        LEFT JOIN producto pr ON d.producto_id = pr.id_prod -- Join para obtener el nombre del producto
        ORDER BY p.id, d.item;
    `);

    const pedidos = result.rows.reduce((acc, row) => {
        const { 
            pedido_id, 
            cliente_id, 
            pedido_fecha, 
            pedido_estado, 
            carrito_id, 
            importe_productos, 
            total_pago, 
            carrito_estado, 
            cliente_nombre, 
            producto_nombre, 
            ...detalle 
        } = row;

        let pedido = acc.find(p => p.pedido_id === pedido_id);
        if (!pedido) {
            pedido = {
                pedido_id,
                cliente_id,
                pedido_fecha,
                pedido_estado,
                carrito_id,
                importe_productos,
                total_pago,
                carrito_estado,
                cliente_nombre, 
                detalles: []
            };
            acc.push(pedido);
        }

        if (detalle.item !== null) {
            detalle.producto_nombre = producto_nombre; 
            pedido.detalles.push(detalle);
        }

        return acc;
    }, []);

    return pedidos;
};


const getPedidoById = async (pedidoId) => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT p.id AS pedido_id, p.fecha AS pedido_fecha, p.estado AS pedido_estado, 
               c.transaccion_id AS carrito_id, c.importe_productos, c.total_pago, c.estado AS carrito_estado,
               d.item, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal
        FROM pedido p
        JOIN carrito c ON p.carrito_id = c.transaccion_id
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        WHERE p.id = $1
        ORDER BY d.item;
    `, [pedidoId]);

    if (result.rows.length === 0) {
        return null;
    }
    const pedido = result.rows.reduce((acc, row) => {
        const { pedido_id, pedido_fecha, pedido_estado, carrito_id, importe_productos, total_pago, carrito_estado, ...detalle } = row;

        if (!acc) {
            acc = {
                pedido_id,
                pedido_fecha,
                pedido_estado,
                carrito_id,
                importe_productos,
                total_pago,
                carrito_estado,
                detalles: []
            };
        }

        if (detalle.item !== null) {
            acc.detalles.push(detalle);
        }

        return acc;
    }, null);

    return pedido;
};

const getPedidoByIdCliente = async (clienteId) => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT p.id AS pedido_id, p.fecha AS pedido_fecha, p.estado AS pedido_estado, 
               c.transaccion_id AS carrito_id, c.importe_productos, c.total_pago, c.estado AS carrito_estado,
               d.item, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal
        FROM pedido p
        JOIN carrito c ON p.carrito_id = c.transaccion_id
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        WHERE c.id_cliente = $1
        ORDER BY p.id, d.item;
    `, [clienteId]);

    if (result.rows.length === 0) {
        return null;
    }


    const pedidos = result.rows.reduce((acc, row) => {
        const { pedido_id, pedido_fecha, pedido_estado, carrito_id, importe_productos, total_pago, carrito_estado, ...detalle } = row;

        let pedido = acc.find(p => p.pedido_id === pedido_id);
        if (!pedido) {
            pedido = {
                pedido_id,
                pedido_fecha,
                pedido_estado,
                carrito_id,
                importe_productos,
                total_pago,
                carrito_estado,
                detalles: []
            };
            acc.push(pedido);
        }

        if (detalle.item !== null) {
            pedido.detalles.push(detalle);
        }

        return acc;
    }, []);

    return pedidos;
};




const confirmarPedido = async (carritoId, clienteId) => {
    const client = await getConnection();
    try {
        await client.query('BEGIN'); 

        
        const carritoResult = await client.query(
            `SELECT * FROM carrito WHERE transaccion_id = $1;`,
            [carritoId]
        );

        if (carritoResult.rows.length === 0) {
            throw new Error("Carrito no encontrado.");
        }

        const carrito = carritoResult.rows[0];

    
        if (!carrito.id_cliente && clienteId) {
            await client.query(
                `UPDATE carrito SET id_cliente = $1 WHERE transaccion_id = $2;`,
                [clienteId, carritoId]
            );
        }

    
        const detallesResult = await client.query(
            `SELECT * FROM detalle WHERE transaccion_id = $1;`,
            [carritoId]
        );

        if (detallesResult.rows.length === 0) {
            throw new Error("El carrito está vacío.");
        }

        const fechaActual = new Date().toISOString().split('T')[0]; 
        const totalPago = carrito.total_pago;

       
        const pedidoResult = await client.query(
            `INSERT INTO pedido (carrito_id, cliente_id, fecha, estado, total_pago)
             VALUES ($1, $2, $3, 'confirmado', $4) RETURNING id;`,
            [carritoId, clienteId, fechaActual, totalPago]
        );

        const pedidoId = pedidoResult.rows[0].id;

        
        await client.query(
            `UPDATE carrito SET temporal = 0, estado = 'En Proceso' WHERE transaccion_id = $1;`,
            [carritoId]
        );

        
        for (const detalle of detallesResult.rows) {
            const productoId = detalle.producto_id;
            const cantidad = detalle.cantidad;

            await client.query(
                `UPDATE producto SET stock = stock - $1 WHERE id_prod = $2;`,
                [cantidad, productoId]
            );
        }

        await client.query('COMMIT'); 
        return { message: "Pedido confirmado con éxito.", pedidoId: pedidoId };
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Error al confirmar el pedido:", error);
        throw error;
    }
};

module.exports = {
    getPedidos,
    getPedidoById,
    confirmarPedido,
    getPedidoByIdCliente
};