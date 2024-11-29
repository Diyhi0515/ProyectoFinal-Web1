const usuarioRepository = require('../repositories/usuarioRepository');

exports.login = async (req, res) => {
    const { loginInput, password  } = req.body;
    
    try {
        let usuario;
        if (loginInput.includes('@')) {
            usuario = await usuarioRepository.getUsuarioByEmail(loginInput);
        } else {
            usuario = await usuarioRepository.getUsuarioByUsername(loginInput);
        }

        if (!usuario) {
            return res.status(401).json({ message: 'Usuario o Contraseña incorrectos' });
        }

        if (usuario.contrasena !== password) {
            return res.status(401).json({ message: 'Usuario o Contraseña incorrectos' });
        }

        delete usuario.contrasena;
        res.status(200).json(usuario);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al intentar loguear usuario' });
    }
};


exports.createCliente = async (req, res) => {
    const {nombre, ap_paterno, ap_materno, nombre_user, email, imagen_id, contrasena} = req.body;
    const usuario = { nombre, ap_paterno, ap_materno, nombre_user, email, imagen_id, contrasena };
    try {
        const newCliente = await usuarioRepository.createCliente(usuario);
        delete newCliente.contrasena;
        return res.status(201).json(newCliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el cliente' });
    }
}

exports.updateUser = async (req, res) => {
    const {id, nombre, ap_paterno, ap_materno, nombre_user, email, nit_ci, celular,imagen_id, contrasena, direcciones} = req.body;
    const usuario = { id, nombre, ap_paterno, ap_materno, nombre_user, email, nit_ci, celular, imagen_id, contrasena, direcciones };
    try {
        const newCliente = await usuarioRepository.updateUsuario(usuario);
        delete newCliente.contrasena;
        return res.status(201).json(newCliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar el usuario' });
    }
}

exports.getUsuarioById = async (req, res) => {
    const id = req.params.id;
    try {
        const usuario = await usuarioRepository.getUsuarioById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el usuario' });
    }
}

