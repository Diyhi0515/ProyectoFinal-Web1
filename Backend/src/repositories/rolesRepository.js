const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}


const getRoles = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM rol');
    return result.rows;
}

const getRolById = async (rolId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM rol WHERE id = $1', [rolId]);

    if (result.rows.length === 0) {
        return null;
    }
    console.log(result);

    return result.rows[0];
};

const createRol = async (rol) => {
    const {
        nombre
    } = rol;
    const client = await getConnection();
    const result = await client.query('INSERT INTO rol (nombre) VALUES ($1) RETURNING *', [nombre]);
    return result.rows[0];
}

const updateRol = async (rol) => {
    const {
        id,
        nombre
    } = rol;
    const client = await getConnection();
    const result = await client.query('UPDATE rol SET nombre = $1 WHERE id = $2 RETURNING *', [nombre,id ]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

const deleteRol = async (rolId) => {
    const client = await getConnection();
    await client.query('DELETE FROM rol WHERE id = $1', [rolId]);
}

module.exports = {
    getRoles,
    getRolById,
    createRol,
    updateRol,
    deleteRol
};