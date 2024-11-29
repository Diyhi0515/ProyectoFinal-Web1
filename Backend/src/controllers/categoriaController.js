const categoriaRepository = require('../repositories/categoriaRepository');

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await categoriaRepository.getCategorias();
        return res.status(200).json(categorias);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener las categorias' });
    }
};

exports.getCategoriaById = async (req, res) => {
    const categoriaId = req.params.categoriaId;
    try {
        const categoria = await categoriaRepository.getCategoriaById(categoriaId);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria no encontrada' });
        }
        return res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener la categoria' });
    }
};



exports.createCategoria = async (req, res) => {
    const categoria = req.body;
    try {
        if (!categoria.nombre) {
            return res.status(400).json({ message: 'Falta el nombre de la categoria'});
        }
        const newCategoria = await categoriaRepository.createCategoria(categoria);
        return res.status(201).json(newCategoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear la categoria' });
    }
};

exports.updateCategoria = async (req, res) => {
    const categoria = req.body;
    try {
        if (!categoria.id_cat || !categoria.nombre) {
            return res.status(400).json({ message: 'Falta el id o el nombre de la categoria'});
        }
        const updatedCategoria = await categoriaRepository.updateCategoria(categoria);
        if (!updatedCategoria) {
            return res.status(404).json({ message: 'Categoria no encontrada' });
        }
        return res.status(200).json(updatedCategoria);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar la categoria' });
    }
};

exports.deleteCategoria = async (req, res) => {
    const categoriaId = req.params.categoriaId;
    try {
        const categoria = await categoriaRepository.getCategoriaById(categoriaId);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoria no encontrada' });
        }
        await categoriaRepository.deleteCategoria(categoriaId);
        return res.status(204).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar la categoria' });
    }
};