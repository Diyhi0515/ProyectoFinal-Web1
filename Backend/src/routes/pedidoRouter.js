const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidoController');

//GET /api/pedido
router.get('/', pedidoController.getPedidos);

//GET /api/pedido/:pedidoId
router.get('/:pedidoId', pedidoController.getPedidoById);

//GET /api/pedido/cliente/:clienteId
router.get('/cliente/:clienteId', pedidoController.getPedidoByCliente);

//POST /api/pedido/:carritoId/:clienteId
router.post('/:carritoId/:clienteId', pedidoController.confirmarPedido);


module.exports = router;