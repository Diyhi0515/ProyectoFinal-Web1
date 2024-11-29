const carritoRepository = require('../repositories/carritoRepository');

exports.getCarritos = async (req, res) => {
    try {
        const carritos = await carritoRepository.getCarritos();
        return res.status(200).json(carritos);
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los carritos' });
    }
}

exports.getCarritoById = async (req, res) => {
    const carritoId = req.params.carritoId;
    try {
        const carrito = await carritoRepository.getCarritoById(carritoId);
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        return res.status(200).json(carrito);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el carrito' });
    }
}

exports.getCarritoByCliente = async (req, res) => {
    const clienteId = req.params.clienteId;
    try {
        const carrito = await carritoRepository.getCarritoByCliente(clienteId);
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        return res.status(200).json(carrito);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el carrito' });
    }
}

exports.createCarrito = async (req, res) => {
    const carrito = req.body;
    try {
        const newCarrito = await carritoRepository.createCarrito(carrito);
        return res.status(201).json(newCarrito);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar crear el carrito' });
    }
}

exports.agregarAlCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    const producto = req.body;
    try {
        const result = await carritoRepository.agregarAlCarrito(carritoId, producto);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar agregar el producto al carrito' });
    }
}
/*
exports.eliminarProductoDCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    const productoId = req.params.productoId;
    const producto = req.body;
    const cantidad = producto.cantidad;
    try {
        const result = await carritoRepository.eliminarDelCarrito(carritoId, productoId, cantidad);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar el producto del carrito' });
    }
}*/

exports.eliminarProductoDCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    const productoId = req.params.productoId;
    try {
        const result = await carritoRepository.eliminarProductoDelCarrito(carritoId, productoId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar eliminar el producto del carrito' });
    }
}

exports.vaciarCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    try {
        const result = await carritoRepository.vaciarCarrito(carritoId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar vaciar el carrito' });
    }
}

exports.sumarAlCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    const producto = req.params.productoId;
    try {
        const result = await carritoRepository.sumarCantidad(carritoId, producto);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar sumar el producto al carrito' });
    }
}

exports.restarAlCarrito = async (req, res) => {
    const carritoId = req.params.carritoId;
    const producto = req.params.productoId;
    try {
        const result = await carritoRepository.restarCantidad(carritoId, producto);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar restar el producto al carrito' });
    }
}