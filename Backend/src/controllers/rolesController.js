const e = require('express');
const rolesRepository = require('../repositories/rolesRepository');

exports.getRoles = async (req, res) => {
    try {
        const roles = await rolesRepository.getRoles();
        return res.status(200).json(roles);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los roles' });
    }
}

exports.getRolById = async (req, res) => {
    const rolId = req.params.rolId;
    try {
        const rol = await rolesRepository.getRolById(rolId);
        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        return res.status(200).json(rol);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el rol' });
    }
}

exports.getRolesByUsuario = async (req, res) => {
    const usuarioId = req.params.usuarioId;
    try {
        const roles = await rolesRepository.getRolesByUsuario(usuarioId);
        return res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los roles' });
    }
}

exports.createRol = async (req, res) => {
    const rol = req.body;
    try {
        if (!rol.nombre) {
            return res.status(400).json({ message: 'Falta el nombre del rol'});
        }
        const newRol = await rolesRepository.createRol(rol);
        return res.status(201).json(newRol);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el rol' });
    }
}

exports.updateRol = async (req, res) => {
    const rol = req.body;
    try {
        if (!rol.id_rol || !rol.nombre) {
            return res.status(400).json({ message: 'Falta el id o el nombre del rol'});
        }
        const updatedRol = await rolesRepository.updateRol(rol);
        if (!updatedRol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        return res.status(200).json(updatedRol);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar el rol' });
    }
}

exports.deleteRol = async (req, res) => {
    const rolId = req.params.rolId;
    try {
        const rol = await rolesRepository.getRolById(rolId);
        if (!rol) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        await rolesRepository.deleteRol(rolId);
        return res.status(204).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar el rol' });
    }
}