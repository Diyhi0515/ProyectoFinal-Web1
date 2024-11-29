const db = require('../database/postgresConnect');
let connection = null;

const getConnection = async () => {
    connection = connection || await db();
    return connection;
}

const getImagenById = async (id) => {
    const connection = await getConnection();

    const query = 'SELECT * FROM imagen WHERE imagenId = $1';
    const values = [id];

    const result = await connection.query(query, values);

    if (result.length === 0) {
        return null; 
    }

    return result.rows[0];
};


const createImagen = async (imagen) => {
    const connection = await getConnection();

    const { fileName, path } = imagen;

    
    if (!fileName || !path) {
        throw new Error('fileName y path son obligatorios');
    }

    const temporal = 1;
    const query = `
        INSERT INTO imagen (fileName, path, temporal, fechaSubida)
        VALUES ($1, $2, $3, NOW())
        RETURNING imagenId;
    `;
    const values = [fileName, path, temporal];

    const { rows } = await connection.query(query, values);

    return rows[0].imagenid;  
};

module.exports = {
    getImagenById,
    createImagen,
};