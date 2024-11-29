const pedidoRepository = require('../repositories/pedidoRepository');

exports.getPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoRepository.getPedidos();
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener los pedidos' });
    }
}

exports.getPedidoById = async (req, res) => {
    const pedidoId = req.params.pedidoId;
    try {
        const pedido = await pedidoRepository.getPedidoById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        return res.status(200).json(pedido);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el pedido' });
    }
}

exports.getPedidoByCliente = async (req, res) => {
    const clienteId = req.params.clienteId;
    try {
        const pedido = await pedidoRepository.getPedidoByIdCliente(clienteId);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        return res.status(200).json(pedido);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar obtener el pedido' });
    }
}

exports.confirmarPedido = async (req, res) => {
    const carritoId = req.params.carritoId;
    const clienteId = req.params.clienteId;
    try {
        const result = await pedidoRepository.confirmarPedido(carritoId, clienteId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al intentar confirmar el pedido' });
    }
}