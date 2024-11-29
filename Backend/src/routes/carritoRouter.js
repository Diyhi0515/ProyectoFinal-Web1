const express = require('express');
const router = express.Router();

const carritoController = require('../controllers/carritoController');

//GET /api/carrito
router.get('/', carritoController.getCarritos);

//GET /api/carrito/:carritoId
router.get('/:carritoId', carritoController.getCarritoById);

//GET /api/carrito/usuario/:clienteId
router.get('/usuario/:clienteId', carritoController.getCarritoByCliente);

//POST /api/carrito
router.post('/', carritoController.agregarAlCarrito);

//POST /api/carrito/:carritoId
router.post('/:carritoId', carritoController.agregarAlCarrito);

//DELETE /api/carrito/:carritoId/:productoId
router.delete('/:carritoId/:productoId', carritoController.eliminarProductoDCarrito);

//DELETE /api/carrito/:carritoId
router.delete('/:carritoId', carritoController.vaciarCarrito);


//PUT /api/carrtio/sumar/:carritoId/:productoId
router.put('/sumar/:carritoId/:productoId', carritoController.sumarAlCarrito);


//PUT /api/carrtio/restar/:carritoId/:productoId
router.put('/restar/:carritoId/:productoId', carritoController.restarAlCarrito);



module.exports = router;