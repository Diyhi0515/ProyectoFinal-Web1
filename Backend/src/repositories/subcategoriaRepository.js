const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}
/*
const getSubcategorias = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM subcategoria');
    return result.rows;
};

const getSubcategoriaById = async (subcategoriaId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM subcategoria WHERE id_subcat= $1', [subcategoriaId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}*/

const getSubcategoriasByCategoria = async (categoriaId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM subcategoria WHERE id_cat = $1', [categoriaId]);
    return result.rows;
}
const getSubcategorias = async () => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT subcategoria.*, categoria.nombre AS categoria_nombre
        FROM subcategoria
        JOIN categoria ON subcategoria.id_cat = categoria.id_cat
    `);
    return result.rows;
};

const getSubcategoriaById = async (subcategoriaId) => {
    const client = await getConnection();
    const result = await client.query(`
        SELECT subcategoria.*, categoria.nombre AS categoria_nombre
        FROM subcategoria
        JOIN categoria ON subcategoria.id_cat = categoria.id_cat
        WHERE subcategoria.id_subcat = $1
    `, [subcategoriaId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};



const createSubcategoria = async (subcategoria) => {
    const {
        nombre,
        id_cat
    } = subcategoria;
    const client = await getConnection();
    const result = await client.query('INSERT INTO subcategoria (nombre, id_cat) VALUES ($1, $2) RETURNING *', [nombre, id_cat]);
    return result.rows[0];
}

const updateSubcategoria = async (subcategoria) => {
    const {
        id_subcat,
        nombre,
        id_cat
    } = subcategoria;
    const client = await getConnection();
    const result = await client.query('UPDATE subcategoria SET nombre = $1, id_cat = $2 WHERE id_subcat = $3 RETURNING *', [nombre, id_cat, id_subcat]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}
/*
const deleteSubcategoria = async (subcategoriaId) => {
    const client = await getConnection();
    await client.query('DELETE FROM subcategoria WHERE id_subcat = $1', [subcategoriaId]);
}*/

const deleteSubcategoria = async (subcategoriaId) => {
    const client = await getConnection();

    try {
        await client.query('BEGIN');

        await client.query(
            'DELETE FROM Producto_Subcategoria WHERE subcat_id = $1',
            [subcategoriaId]
        );

        await client.query(
            'DELETE FROM Subcategoria WHERE id_subcat = $1',
            [subcategoriaId]
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


module.exports = {
    getSubcategorias,
    getSubcategoriaById,
    getSubcategoriasByCategoria,
    createSubcategoria,
    updateSubcategoria,
    deleteSubcategoria
};