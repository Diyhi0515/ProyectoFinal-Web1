const e = require('express');
const db = require('../database/postgresConnect');
const { use } = require('../routes/imagenRouter');
let connection = null;


const getConnection = async () => {
    if (connection === null) {
        connection = await db();
    }
    return connection;
}


const getDirecciones = async (userId) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM Direccion WHERE id_user = $1', [userId]);
    return result.rows;
}



exports.getAdminByUsername = async (username) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE nombre_user = $1', [username]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.usuario_id);
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

exports.getAdminByEmail = async (email) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.usuario_id);
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};




exports.createAdmin= async (usuario) => {
    const client = await getConnection();
    const { nombre, ap_paterno , ap_materno,  nombre_user, email, imagen_id, rol_id, contrasena} = usuario;
    console.log(usuario);
    try{
        const existignUser = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if(existignUser.length > 0){
            throw new Error('Administrador ya existe');
        }

        const existignImagen = !isNaN(imagen_id) && imagen_id > 0;
        if(existignImagen){
            await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
        }

        const data = [nombre, ap_paterno, ap_materno, nombre_user, email, contrasena, rol_id, imagen_id];

        const result = await client.query('INSERT INTO usuario (nombre, ap_paterno, ap_materno, nombre_user, email, contrasena, rol_id, imagen_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', data);
        if(result.length === 0){
            throw new Error('Error al crear Administrador');
        }

        return result.rows[0];

    }catch(err){
        console.log("Error al crear Adminstrador:" ,err);
        return null;
    }

};


exports.getAdminById = async (id) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE id = $1', [id]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.usuario_id);
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};


exports.getUsuariosRol= async () => {
    const client = await getConnection();
    const query = `
        SELECT u.id, u.nombre, u.ap_paterno, u.ap_materno, u.nombre_user, u.email, 
               u.nit_ci, u.celular, u.imagen_id, u.rol_id, r.nombre AS rol_nombre
        FROM Usuario u
        INNER JOIN Rol r ON u.rol_id = r.id
        WHERE u.rol_id != 2; 
    `;
    const result = await client.query(query);
    return result.rows;
};

exports.getUsuarioById = async (userId) => {
    const client = await getConnection();
    const query = `
        SELECT u.id, u.nombre, u.ap_paterno, u.ap_materno, u.nombre_user, u.email, 
               u.nit_ci, u.celular, u.imagen_id, u.rol_id, r.nombre AS rol_nombre
        FROM Usuario u
        INNER JOIN Rol r ON u.rol_id = r.id
        WHERE u.id = $1;
    `;
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};


exports.updateAdmin = async (usuario) => {
    const client = await getConnection();
    const { id, nombre, ap_paterno, ap_materno, nombre_user, email, imagen_id, rol_id, contrasena } = usuario;
    console.log(usuario);    
    const oldUser = await this.getUsuarioById(id);

    const existeImage = !isNaN(imagen_id) && imagen_id > 0;

    const data = [nombre, ap_paterno, ap_materno, nombre_user, email, existeImage ? imagen_id : null, rol_id, id];
    const pstg = `UPDATE usuario SET nombre = $1, ap_paterno = $2, ap_materno = $3, nombre_user = $4, email = $5, imagen_id = $6, rol_id = $7 WHERE id = $8 RETURNING *`;

    const result = await client.query(pstg, data);

    if(existeImage){
        await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
    }
    if(oldUser.imagen_id && oldUser.imagen_id !== imagen_id){
        await client.query('UPDATE imagen SET temporal = 1 WHERE imagenId = $1', [oldUser.imagen_id]);
    }

    return result.rows[0];
};

exports.deleteAdmin = async (userId) => {
    const client = await getConnection();
    await client.query('DELETE FROM usuario WHERE id = $1', [userId]);
};
