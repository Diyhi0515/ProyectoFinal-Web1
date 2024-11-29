const db = require('../database/postgresConnect');
const { use } = require('../routes/imagenRouter');
let connection = null;


const getConnection = async () => {
    if (connection === null) {
        connection = await db();
    }
    return connection;
}


const getBaners = async () => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM Banners');
    return result.rows;
}

const getBanerById = async (banerId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM Banners WHERE bannerId = $1', [banerId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

module.exports = {
    getBaners,
    getBanerById
};
