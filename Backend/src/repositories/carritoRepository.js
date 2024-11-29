const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}


const getCarritos = async () => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT c.transaccion_id, c.importe_productos, c.estado, c.temporal, c.fecha, c.total_pago, c.id_cliente,
               d.item, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal
        FROM carrito c
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        ORDER BY c.transaccion_id, d.item;
    `);
    const carritos = result.rows.reduce((acc, row) => {
        const { transaccion_id, importe_productos, estado, temporal, fecha, total_pago, id_cliente, ...detalle } = row;

        let carrito = acc.find(c => c.transaccion_id === transaccion_id);
        if (!carrito) {
            carrito = {
                transaccion_id,
                importe_productos,
                estado,
                temporal,
                fecha,
                total_pago,
                id_cliente,
                detalles: []
            };
            acc.push(carrito);
        }

        if (detalle.item !== null) {
            carrito.detalles.push(detalle);
        }

        return acc;
    }, []);

    return carritos;
};


const getCarritoById = async (carritoId) => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT c.transaccion_id, c.importe_productos, c.estado, c.temporal, c.fecha, c.total_pago, c.id_cliente,
               d.item, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal
        FROM carrito c
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        WHERE c.transaccion_id = $1
        ORDER BY d.item;
    `, [carritoId]);

    if (result.rows.length === 0) {
        return null;
    }

    const carrito = {
        transaccion_id: result.rows[0].transaccion_id,
        importe_productos: result.rows[0].importe_productos,
        estado: result.rows[0].estado,
        temporal: result.rows[0].temporal,
        fecha: result.rows[0].fecha,
        total_pago: result.rows[0].total_pago,
        id_cliente: result.rows[0].id_cliente,
        detalles: []
    };

    result.rows.forEach(row => {
        if (row.item !== null) {
            carrito.detalles.push({
                item: row.item,
                producto_id: row.producto_id,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario,
                subtotal: row.subtotal
            });
        }
    });

    return carrito;
};

const getCarritoByIdUser = async (userId) => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT c.transaccion_id, c.importe_productos, c.estado, c.temporal, c.fecha, c.total_pago, c.id_cliente,
               d.item, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal
        FROM carrito c
        LEFT JOIN detalle d ON c.transaccion_id = d.transaccion_id
        WHERE c.id_cliente = $1
        ORDER BY c.transaccion_id, d.item;
    `, [userId]);

    if (result.rows.length === 0) {
        return null;
    }
    
    const carritos = result.rows.reduce((acc, row) => {
        const { transaccion_id, importe_productos, estado, temporal, fecha, total_pago, id_cliente, ...detalle } = row;

        let carrito = acc.find(c => c.transaccion_id === transaccion_id);
        if (!carrito) {
            carrito = {
                transaccion_id,
                importe_productos,
                estado,
                temporal,
                fecha,
                total_pago,
                id_cliente,
                detalles: []
            };
            acc.push(carrito);
        }

        if (detalle.item !== null) {
            carrito.detalles.push(detalle);
        }

        return acc;
    }, []);

    return carritos;
};




const createCarrito = async () => {
    const client = await getConnection();

    try {
        const result = await client.query(
            `INSERT INTO carrito (importe_productos, total_pago, temporal, fecha)
             VALUES (0, 0, 1, NOW()) RETURNING transaccion_id;`
        );

        return result.rows[0].transaccion_id;
    } catch (error) {
        console.error("Error al crear carrito:", error);
        throw error;
    }
};

const agregarAlCarrito = async (carritoId, detalle) => {
    const { producto_id, cantidad, id_cliente} = detalle; 
    console.log("detalle", detalle);
    const client = await getConnection();
    try {
        await client.query('BEGIN');

        let carrito = carritoId;

        if (!carrito) {
           carrito = await createCarrito();  
        }

        existignUser = await client.query('SELECT * FROM usuario WHERE id = $1', [id_cliente]);
        if(existignUser.rows.length > 0){
           await client.query('UPDATE carrito SET id_cliente = $1 WHERE transaccion_id = $2;', [id_cliente, carrito]);
        }

        const productoResult = await client.query(
            `SELECT precio, stock FROM producto WHERE id_prod = $1 AND estado = 1;`,
            [producto_id]
        );

        if (productoResult.rows.length === 0) {
            throw new Error("Producto no encontrado o no disponible.");
        }

        const producto = productoResult.rows[0];
        

        if (producto.stock < cantidad) {
            throw new Error("Stock insuficiente para el producto.");
        }

        const subtotal = producto.precio * cantidad;
        
        await client.query(
            `INSERT INTO detalle (transaccion_id, producto_id, cantidad, precio_unitario, subtotal)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (transaccion_id, producto_id)
             DO UPDATE SET cantidad = detalle.cantidad + EXCLUDED.cantidad, 
                           subtotal = detalle.subtotal + EXCLUDED.subtotal;`,
            [carrito, producto_id, cantidad, producto.precio, subtotal]
        );

        await client.query(
            `UPDATE carrito
             SET importe_productos = importe_productos + $3,
                 total_pago = total_pago + $1
             WHERE transaccion_id = $2;`,
            [subtotal, carrito, cantidad]
        );

        await client.query('COMMIT');

        return { message: "Producto agregado al carrito.", carritoId: carrito };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al agregar al carrito:", error);
        throw error;
    }
};

/*
const eliminarDelCarrito = async (carritoId, productoId, cantidad) => {
    const client = await getConnection();
    try {
        const productoResult = await client.query(
            `SELECT cantidad, subtotal FROM detalle WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        if (productoResult.rows.length === 0) {
            throw new Error("Producto no encontrado en el carrito.");
        }

        const producto = productoResult.rows[0];

        if (producto.cantidad < cantidad) {
            throw new Error("No hay suficiente cantidad para eliminar.");
        }

        const subtotalEliminado = producto.subtotal * (cantidad / producto.cantidad);

        await client.query(
            `DELETE FROM detalle WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        await client.query(
            `UPDATE carrito
             SET importe_productos = importe_productos - $1,
                 total_pago = total_pago - $1
             WHERE transaccion_id = $2;`,
            [subtotalEliminado, carritoId]
        );

        const carritoResult = await client.query(
            `SELECT COUNT(*) FROM detalle WHERE transaccion_id = $1;`,
            [carritoId]
        );

        const detallesRestantes = parseInt(carritoResult.rows[0].count, 10);

        if (detallesRestantes === 0) {
            await client.query(
                `DELETE FROM carrito WHERE transaccion_id = $1 AND es_temporal = 1;`,
                [carritoId]
            );
        }

        return { message: "Producto eliminado del carrito.", carritoId: carritoId };
    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        throw error;
    }
};*/

const eliminarProductoDelCarrito = async (carritoId, productoId) => {
    const client = await getConnection();

    try {
        await client.query('BEGIN');

        const detalleResult = await client.query(
            `SELECT cantidad, subtotal 
             FROM detalle 
             WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        if (detalleResult.rows.length === 0) {
            throw new Error("El producto no se encuentra en el carrito.");
        }

        const { cantidad, subtotal } = detalleResult.rows[0];

        await client.query(
            `DELETE FROM detalle 
             WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        await client.query(
            `UPDATE carrito 
             SET importe_productos = importe_productos - $1, 
                 total_pago = total_pago - $2 
             WHERE transaccion_id = $3;`,
            [cantidad, subtotal, carritoId]
        );

        const detalleCountResult = await client.query(
            `SELECT COUNT(*) AS detalles_restantes 
             FROM detalle 
             WHERE transaccion_id = $1;`,
            [carritoId]
        );

        const detallesRestantes = parseInt(detalleCountResult.rows[0].detalles_restantes, 10);

        if (detallesRestantes === 0) {
            await client.query(
                `DELETE FROM carrito 
                 WHERE transaccion_id = $1 AND temporal = 1;`,
                [carritoId]
            );
        }

        await client.query('COMMIT'); 
        return { message: "Producto eliminado del carrito exitosamente." };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al eliminar producto del carrito:", error);
        throw error;
    }
};


const vaciarCarrito = async (carritoId) => {
    const client = await getConnection();
    try {
        await client.query(
            `DELETE FROM detalle WHERE transaccion_id = $1;`,
            [carritoId]
        );

        await client.query(
            `DELETE FROM carrito WHERE transaccion_id = $1 AND temporal = 1;`,
            [carritoId]
        );

        return { message: "Carrito vaciado." };
    } catch (error) {
        console.error("Error al vaciar carrito:", error);
        throw error;
    }
}


const sumarCantidad = async (carritoId, productoId) => {
    const client = await getConnection();
    try {
        await client.query('BEGIN');

        const productoResult = await client.query(
            `SELECT cantidad, precio_unitario 
             FROM detalle 
             WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        if (productoResult.rows.length === 0) {
            throw new Error("Producto no encontrado en el carrito.");
        }

        const { cantidad, precio_unitario } = productoResult.rows[0];

        await client.query(
            `UPDATE detalle 
             SET cantidad = cantidad + 1, 
                 subtotal = subtotal + $1 
             WHERE transaccion_id = $2 AND producto_id = $3;`,
            [precio_unitario, carritoId, productoId]
        );


        await client.query(
            `UPDATE carrito 
             SET importe_productos = importe_productos + 1, 
                 total_pago = total_pago + $1 
             WHERE transaccion_id = $2;`,
            [precio_unitario, carritoId]
        );

        await client.query('COMMIT');
        return { message: 'Cantidad incrementada en el carrito.' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al sumar cantidad:', error);
        throw error;
    }
};

const restarCantidad = async (carritoId, productoId) => {
    const client = await getConnection();
    try {
        await client.query('BEGIN');


        const productoResult = await client.query(
            `SELECT cantidad, precio_unitario 
             FROM detalle 
             WHERE transaccion_id = $1 AND producto_id = $2;`,
            [carritoId, productoId]
        );

        if (productoResult.rows.length === 0) {
            throw new Error("Producto no encontrado en el carrito.");
        }

        const { cantidad, precio_unitario } = productoResult.rows[0];

        if (cantidad <= 1) {
            throw new Error("La cantidad no puede ser menor a 1.");
        }

        await client.query(
            `UPDATE detalle 
             SET cantidad = cantidad - 1, 
                 subtotal = subtotal - $1 
             WHERE transaccion_id = $2 AND producto_id = $3;`,
            [precio_unitario, carritoId, productoId]
        );


        await client.query(
            `UPDATE carrito 
             SET importe_productos = importe_productos - 1, 
                 total_pago = total_pago - $1 
             WHERE transaccion_id = $2;`,
            [precio_unitario, carritoId]
        );

        await client.query('COMMIT');
        return { message: 'Cantidad reducida en el carrito.' };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al restar cantidad:', error);
        throw error;
    }
};






module.exports = {
    getCarritos,
    getCarritoById,
    createCarrito,
    agregarAlCarrito,
    vaciarCarrito,
    sumarCantidad,
    restarCantidad,
    eliminarProductoDelCarrito,
};