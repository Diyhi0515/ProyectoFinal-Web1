const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}

const getSubcategorias = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM subcategoria');
    return result.rows;
}

const getCategorias = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM categoria');
    return result.rows;
};

const getCategoriaById = async (categoriaId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM categoria WHERE id_cat= $1', [categoriaId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

const createCategoria = async (categoria) => {
    const {
        nombre
    } = categoria;
    const client = await getConnection();
    const result = await client.query('INSERT INTO categoria (nombre) VALUES ($1) RETURNING *', [nombre]);
    return result.rows[0];
}

const updateCategoria = async (categoria) => {
    const {
        id_cat,
        nombre
    } = categoria;
    const client = await getConnection();
    const result = await client.query('UPDATE categoria SET nombre = $1 WHERE id_cat = $2 RETURNING *', [nombre,id_cat ]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

/*
const deleteCategoria = async (categoriaId) => {
    const client = await getConnection();
    await client.query('DELETE FROM categoria WHERE id_cat = $1', [categoriaId]);
}*/

const deleteCategoria = async (categoriaId) => {
    const client = await getConnection();

    try {
        await client.query('BEGIN');
        await client.query(
            'DELETE FROM Producto_Subcategoria WHERE id_cat = $1',
            [categoriaId]
        );

        await client.query(
            'DELETE FROM Subcategoria WHERE id_cat = $1',
            [categoriaId]
        );


        await client.query(
            'DELETE FROM Categoria WHERE id_cat = $1',
            [categoriaId]
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
    getCategorias,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria
};