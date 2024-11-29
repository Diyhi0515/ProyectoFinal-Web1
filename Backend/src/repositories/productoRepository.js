const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}

/*
const getProductos = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM producto');
    return result.rows;
};

const getProductoById = async (productoId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM producto WHERE id_prod= $1', [productoId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}*/

const getProductos = async () => {
    const client = await getConnection();

    const query = `
        SELECT 
            p.id_prod, 
            p.nombre AS producto_nombre,
            p.descripcion, 
            p.precio, 
            p.imagen_id, 
            p.uni_medida, 
            p.stock, 
            p.estado,
            p.calificacion,
            json_agg(
                json_build_object(
                    'id_cat', c.id_cat, 
                    'nombre_categoria', c.nombre, 
                    'id_subcat', s.id_subcat, 
                    'nombre_subcategoria', s.nombre
                )
            ) AS categorias
        FROM producto p
        LEFT JOIN producto_subcategoria ps ON p.id_prod = ps.producto_id
        LEFT JOIN subcategoria s ON ps.subcat_id = s.id_subcat AND ps.id_cat = s.id_cat
        LEFT JOIN categoria c ON s.id_cat = c.id_cat
        GROUP BY p.id_prod
    `;

    const result = await client.query(query);
    return result.rows;
};


const getProductoById = async (productoId) => {
    const client = await getConnection();

    const query = `
        SELECT 
            p.id_prod, 
            p.nombre AS producto_nombre,
            p.descripcion, 
            p.precio, 
            p.imagen_id, 
            p.uni_medida, 
            p.stock, 
            p.estado,
            p.calificacion,
            json_agg(
                json_build_object(
                    'id_cat', c.id_cat, 
                    'nombre_categoria', c.nombre, 
                    'id_subcat', s.id_subcat, 
                    'nombre_subcategoria', s.nombre
                )
            ) AS categorias
        FROM producto p
        LEFT JOIN producto_subcategoria ps ON p.id_prod = ps.producto_id
        LEFT JOIN subcategoria s ON ps.subcat_id = s.id_subcat AND ps.id_cat = s.id_cat
        LEFT JOIN categoria c ON s.id_cat = c.id_cat
        WHERE p.id_prod = $1
        GROUP BY p.id_prod
    `;

    const result = await client.query(query, [productoId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

const getProductosBySubcategoria = async (subcategoriaId) => {
    const client = await getConnection();
    
    try {

        const queryIds = `
            SELECT p.id_prod
            FROM producto p
            INNER JOIN producto_subcategoria ps ON p.id_prod = ps.producto_id
            WHERE ps.subcat_id = $1
        `;
        
        const resultIds = await client.query(queryIds, [subcategoriaId]);
        
        if (resultIds.rows.length === 0) {
            return null; 
        }

        const productIds = resultIds.rows.map(row => row.id_prod);


        const productos = [];
        for (const id of productIds) {
            const producto = await getProductoById(id);
            if (producto) {
                productos.push(producto);
            }
        }

        return productos; 
    } catch (error) {
        console.error('Error al obtener productos por subcategoría:', error);
        throw error;
    }
};


const getProductosMejorCalificacion = async () => {
    const client = await getConnection();

    const query = `
        SELECT 
            p.id_prod, 
            p.nombre AS producto_nombre,
            p.descripcion, 
            p.precio, 
            p.imagen_id, 
            p.uni_medida, 
            p.stock, 
            p.estado,
            p.calificacion,
            json_agg(
                json_build_object(
                    'id_cat', c.id_cat, 
                    'nombre_categoria', c.nombre, 
                    'id_subcat', s.id_subcat, 
                    'nombre_subcategoria', s.nombre
                )
            ) AS categorias
        FROM producto p
        LEFT JOIN producto_subcategoria ps ON p.id_prod = ps.producto_id
        LEFT JOIN subcategoria s ON ps.subcat_id = s.id_subcat AND ps.id_cat = s.id_cat
        LEFT JOIN categoria c ON s.id_cat = c.id_cat
        WHERE p.calificacion >= 5
        GROUP BY p.id_prod
    `;

    const result = await client.query(query);
    return result.rows;
};

const getProductosByLetra = async (letras) => {
    const client = await getConnection();

    const query = `
        SELECT 
            p.id_prod, 
            p.nombre AS producto_nombre,
            p.descripcion, 
            p.precio, 
            p.imagen_id, 
            p.uni_medida, 
            p.stock, 
            p.estado,
            p.calificacion,
            json_agg(
                json_build_object(
                    'id_cat', c.id_cat, 
                    'nombre_categoria', c.nombre, 
                    'id_subcat', s.id_subcat, 
                    'nombre_subcategoria', s.nombre
                )
            ) AS categorias
        FROM producto p
        LEFT JOIN producto_subcategoria ps ON p.id_prod = ps.producto_id
        LEFT JOIN subcategoria s ON ps.subcat_id = s.id_subcat AND ps.id_cat = s.id_cat
        LEFT JOIN categoria c ON s.id_cat = c.id_cat
        WHERE p.nombre ILIKE '%' || $1 || '%'
        GROUP BY p.id_prod
    `;

    const values = [`${letras}%`]; 

    const result = await client.query(query, values);
    return result.rows;
};




const createProducto = async (producto) => {
    const client = await getConnection();
    const { nombre, descripcion, precio, imagen_id, uni_medida, stock, estado, calificacion, subcategorias } = producto;

    try {
        const existeImagen = !isNaN(imagen_id) && imagen_id > 0;

        await client.query('BEGIN');

        const productoQuery = `
            INSERT INTO producto (nombre, descripcion, precio, imagen_id, uni_medida, stock, estado, calificacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const productoValues = [nombre, descripcion, precio, existeImagen ? imagen_id : null, uni_medida, stock, estado, calificacion];
        const productoResult = await client.query(productoQuery, productoValues);

        const nuevoProducto = productoResult.rows[0];

        if (existeImagen) {
            await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
        }

        if (subcategorias && subcategorias.length > 0) {
            for (const subcat of subcategorias) {
                const { id_subcat, id_cat } = subcat;

                const subcategoriaQuery = `
                    INSERT INTO producto_subcategoria (producto_id, subcat_id, id_cat)
                    VALUES ($1, $2, $3)
                `;
                const subcategoriaValues = [nuevoProducto.id_prod, id_subcat, id_cat];
                await client.query(subcategoriaQuery, subcategoriaValues);
            }
        }


        await client.query('COMMIT');

        return nuevoProducto;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear el producto:', error);
        throw error;
    }
};



const updateProducto = async (producto) => {
    const client = await getConnection();
    const {id_prod, nombre, descripcion, precio, imagen_id, uni_medida, stock, estado, calificacion, subcategorias } = producto;
    const productoId = id_prod;
    

    try {
        const oldProducto = await getProductoById(productoId);
        if (!oldProducto) {
            throw new Error('Producto no encontrado');
        }

        const existeImagen = !isNaN(imagen_id) && imagen_id > 0;

        await client.query('BEGIN');

        const productoQuery = `
            UPDATE producto
            SET nombre = $1, descripcion = $2, precio = $3, imagen_id = $4,
                uni_medida = $5, stock = $6, estado = $7, calificacion = $8
            WHERE id_prod = $9 RETURNING *
        `;
        const productoValues = [nombre, descripcion, precio, existeImagen ? imagen_id : null, uni_medida, stock, estado, calificacion, productoId];
        const productoResult = await client.query(productoQuery, productoValues);

        if (existeImagen) {
            await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
        }

        if (oldProducto.imagen_id && oldProducto.imagen_id !== imagen_id) {
            await client.query('UPDATE imagen SET temporal = 1 WHERE imagenId = $1', [oldProducto.imagen_id]);
        }


        if (subcategorias) {
            const deleteSubcategoriasQuery = `
                DELETE FROM producto_subcategoria
                WHERE producto_id = $1
            `;
            await client.query(deleteSubcategoriasQuery, [productoId]);

            for (const subcat of subcategorias) {
                const { id_subcat, id_cat } = subcat;

                const insertSubcategoriaQuery = `
                    INSERT INTO producto_subcategoria (producto_id, subcat_id, id_cat)
                    VALUES ($1, $2, $3)
                `;
                const insertSubcategoriaValues = [productoId, id_subcat, id_cat];
                await client.query(insertSubcategoriaQuery, insertSubcategoriaValues);
            }
        }

        await client.query('COMMIT');

        const productoActualizado = await getProductoById(productoId);
        return productoActualizado;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar el producto:', error);
        throw error;
    }
};

const deleteProducto = async (productoId) => {
    const client = await getConnection();
    
    try {
        await client.query('BEGIN');
        
        const deleteSubcategoriasQuery = `
            DELETE FROM producto_subcategoria
            WHERE producto_id = $1
        `;
        await client.query(deleteSubcategoriasQuery, [productoId]);

        const deleteProductoQuery = `
            DELETE FROM producto
            WHERE id_prod = $1
            RETURNING *
        `;
        const result = await client.query(deleteProductoQuery, [productoId]);

        if (result.rows.length === 0) {
            throw new Error('Producto no encontrado');
        }
        await client.query('COMMIT');      

        return result.rows[0];
    } catch (error) {

        await client.query('ROLLBACK');
        console.error('Error al eliminar el producto:', error);
        throw error; 
    }
};



module.exports = {
    getProductos,
    getProductoById,
    getProductosBySubcategoria,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosMejorCalificacion,
    getProductosByLetra
}