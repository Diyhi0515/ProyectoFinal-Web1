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



exports.getUsuarioByUsername = async (username) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE nombre_user = $1', [username]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.id);
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

exports.getUsuarioByEmail = async (email) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE email = $1', [email]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.id);
        
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};


exports.createCliente= async (usuario) => {
    const client = await getConnection();
    const roles = await client.query('SELECT * FROM rol WHERE nombre = $1', ['Cliente']);
    const { nombre, ap_paterno , ap_materno,  nombre_user, email, imagen_id, contrasena } = usuario;
    try{
        const existignUser = await client.query('SELECT * FROM usuario WHERE nombre = $1 OR email = $2', [nombre_user, email]);
        if(existignUser.length > 0){
            throw new Error('Usuario ya existe');
        }

        const existignImagen = !isNaN(imagen_id) && imagen_id > 0;
        if(existignImagen){
            await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
        }

        const data = [nombre, ap_paterno, ap_materno, nombre_user, email, contrasena, roles.rows[0].id, imagen_id];

        const result = await client.query('INSERT INTO usuario (nombre, ap_paterno, ap_materno, nombre_user, email, contrasena, rol_id, imagen_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', data);
        if(result.length === 0){
            throw new Error('Error al crear usuario');
        }

        return result.rows[0];

    }catch(err){
        console.log("Error al crear cliente:" ,err);
        return null;
    }

};


exports.getUsuarioById = async (id) => {
    const client = await getConnection();
    const result = await client.query('SELECT * FROM usuario WHERE id = $1', [id]);

    for (let user of result.rows) {
        user.direcciones = await getDirecciones(user.id);
        user.direccion = user.direcciones.length > 0 ? user.direcciones[0] : "";
    }

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};


exports.updateUsuario = async (usuario) => {
    const client = await getConnection();
    const { id, nombre, ap_paterno, ap_materno, nombre_user, email, nit_ci, celular, imagen_id, contrasena, direcciones } = usuario;
    console.log(usuario);    
    const oldUser = await this.getUsuarioById(id);

    const existeImage = !isNaN(imagen_id) && imagen_id > 0;

    const data = [nombre, ap_paterno, ap_materno, nombre_user, email, nit_ci, celular, existeImage ? imagen_id : null, id];
    const pstg = `UPDATE usuario SET nombre = $1, ap_paterno = $2, ap_materno = $3, nombre_user = $4, email = $5, nit_ci = $6, celular = $7, imagen_id = $8 WHERE id = $9 RETURNING *`;

    const result = await client.query(pstg, data);

    if(existeImage){
        await client.query('UPDATE imagen SET temporal = 0 WHERE imagenId = $1', [imagen_id]);
    }
    if(oldUser.imagen_id && oldUser.imagen_id !== imagen_id){
        await client.query('UPDATE imagen SET temporal = 1 WHERE imagenId = $1', [oldUser.imagen_id]);
    }

    for (let direccion of oldUser.direcciones) {
        const direccionExisteEnNewUser= direcciones.find(d => d.id_direc == direccion.id_direc);
        if(direccionExisteEnNewUser){
            continue;
        }
        const data = [direccion.id_direc];
        const pstg = `DELETE FROM Direccion WHERE id_direc = $1`;
        await client.query(pstg, data);
    }

    for (let direccion of direcciones) {
        if(direccion.id_direc && direccion.id_direc != 0 && direccion.id_direc != null && direccion.id_direc != undefined){
            const data = [direccion.direccion, direccion.id_direc];
            const pstg = `UPDATE Direccion SET direccion = $1 WHERE id_direc = $2`;
            await client.query(pstg, data);
            continue;
        }
        const data = [direccion.direccion, id];
        console.log(data);
        const pstg = `INSERT INTO Direccion (direccion, id_user) values ( $1,$2)`;
        await client.query(pstg, data);
    }

    const updatedUser = await this.getUsuarioById(id);
    return updatedUser;
}