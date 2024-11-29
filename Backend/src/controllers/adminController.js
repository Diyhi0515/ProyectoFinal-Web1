const e = require('express');
const usuarioRepository = require('../repositories/adminRepository');

exports.login = async (req, res) => {
    const { loginInput, password  } = req.body;
    
    try {
        let usuario;
        if (loginInput.includes('@')) {
            usuario = await usuarioRepository.getAdminByEmail(loginInput);
        } else {
            usuario = await usuarioRepository.getAdminByUsername(loginInput);
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

exports.createRol = async (req, res) => {
    const rol = req.body;
    try {
        const newRol = await usuarioRepository.createRol(rol);
        return res.status(201).json(newRol);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el rol' });
    }
}

exports.createAdmin = async (req, res) => {
    const { nombre, ap_paterno , ap_materno,  nombre_user, email, imagen_id, rol_id, contrasena} = req.body;
    const usuario = { nombre, ap_paterno, ap_materno, nombre_user, email, imagen_id, rol_id, contrasena };
    console.log(usuario);
    try {
        const newCliente = await usuarioRepository.createAdmin(usuario);
        delete newCliente.contrasena;
        return res.status(201).json(newCliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el Admin' });
    }
}



exports.getAdmins = async (req, res) => {
    try {
        const usuarios = await usuarioRepository.getUsuariosRol();
        return res.status(200).json(usuarios);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los usuarios' });
    }
}

exports.getAdminById = async (req, res) => {
    const usuarioId = req.params.usuarioId;
    try {
        const usuario = await usuarioRepository.getUsuarioById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el usuario' });
    }
}

exports.updateAdmin = async (req, res) => {
    const usuario = req.body;
    try {
        const updatedUsuario = await usuarioRepository.updateAdmin(usuario);
        if (!updatedUsuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(updatedUsuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar el usuario' });
    }
}

exports.deleteAdmin = async (req, res) => {
    const usuarioId = req.params.usuarioId;
    try {
        const usuario = await usuarioRepository.deleteAdmin(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar el usuario' });
    }
}

