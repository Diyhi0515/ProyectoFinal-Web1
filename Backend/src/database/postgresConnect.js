require('dotenv').config();

const pg = require('pg');

const dbConecction = async () => {
    const client = new pg.Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT

        
    });

    await client.connect();
    return client;    
};

module.exports = dbConecction;