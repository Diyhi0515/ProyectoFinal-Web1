const e = require('express');
const productoRepository = require('../repositories/productoRepository');

exports.getProductos = async (req, res) => {
    try {
        const productos = await productoRepository.getProductos();
        return res.status(200).json(productos);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los productos' });
    }
}

exports.getProductoById = async (req, res) => {
    const productoId = req.params.productoId;
    try {
        const producto = await productoRepository.getProductoById(productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el producto' });
    }
}

exports.getProductosBySubcategoria = async (req, res) => {
    const subcategoriaId = req.params.subcategoriaId;
    
    try {
        const productos = await productoRepository.getProductosBySubcategoria(subcategoriaId);
        return res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los productos' });
    }
}

exports.getMejoresProductos = async (req, res) => {
    try {
        const productos = await productoRepository.getProductosMejorCalificacion();
        return res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los productos' });
    }
}

exports.getProductosByLetras = async (req, res) => {
    const letras = req.params.letras ;
    try {
        const productos = await productoRepository.getProductosByLetra(letras);
        return res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los productos' });
    }
}




exports.createProducto = async (req, res) => {
    const producto = req.body;
    try {
        if (!producto.nombre) {
            return res.status(400).json({ message: 'Falta el nombre del producto'});
        }
        const newProducto = await productoRepository.createProducto(producto);
        return res.status(201).json(newProducto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el producto' });
    }
}

exports.updateProducto = async (req, res) => {
    const producto = req.body;
    try {
        if (!producto.id_prod || !producto.nombre) {
            return res.status(400).json({ message: 'Falta el id o el nombre del producto'});
        }
        const updatedProducto = await productoRepository.updateProducto(producto);
        if (!updatedProducto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json(updatedProducto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar actualizar el producto' });
    }
}

exports.deleteProducto = async (req, res) => {
    const productoId = req.params.productoId;
    try {
        const producto = await productoRepository.getProductoById(productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        await productoRepository.deleteProducto(productoId);
        return res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar el producto' });
    }
}