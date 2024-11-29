const e = require('express');
const subcategoriaRepository = require('../repositories/subcategoriaRepository');

exports.getSubcategorias = async (req, res) => {
    try {
        const subcategorias = await subcategoriaRepository.getSubcategorias();
        return res.status(200).json(subcategorias);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener las subcategorias' });
    }
}

exports.getSubcategoriaById = async (req, res) => {
    const subcategoriaId = req.params.subcategoriaId;
    try {
        const subcategoria = await subcategoriaRepository.getSubcategoriaById(subcategoriaId);
        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoria no encontrada' });
        }
        return res.status(200).json(subcategoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener la subcategoria' });
    }
}

exports.getSubcategoriasByCategoria = async (req, res) => {
    const categoriaId = req.params.categoriaId;
    try {
        const subcategorias = await subcategoriaRepository.getSubcategoriasByCategoria(categoriaId);
        return res.status(200).json(subcategorias);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener las subcategorias' });
    }
}

exports.createSubcategoria = async (req, res) => {
    const subcategoria = req.body;
    try {
        if (!subcategoria.nombre) {
            return res.status(400).json({ message: 'Falta el nombre de la subcategoria'});
        }
        const newSubcategoria = await subcategoriaRepository.createSubcategoria(subcategoria);
        return res.status(201).json(newSubcategoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear la subcategoria' });
    }
}

exports.updateSubcategoria = async (req, res) => {
    const subcategoria = req.body;
    try {
        if (!subcategoria.id_subcat || !subcategoria.nombre) {
            return res.status(400).json({ message: 'Falta el id o el nombre de la subcategoria'});
        }
        const updatedSubcategoria = await subcategoriaRepository.updateSubcategoria(subcategoria);
        if (!updatedSubcategoria) {
            return res.status(404).json({ message: 'Subcategoria no encontrada' });
        }
        return res.status(200).json(updatedSubcategoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar la subcategoria' });
    }
}

exports.deleteSubcategoria = async (req, res) => {
    const subcategoriaId = req.params.subcategoriaId;
    try {
        const result = await subcategoriaRepository.deleteSubcategoria(subcategoriaId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar la subcategoria' });
    }
}