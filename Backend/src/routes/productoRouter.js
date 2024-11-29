const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');

//GET /api/producto
router.get('/', productoController.getProductos);

//GET /api/producto/mejores
router.get('/mejores', productoController.getMejoresProductos);

//GET /api/producto/:productoId
router.get('/:productoId', productoController.getProductoById);

//GET /api/producto/subcategoria/:subcategoriaId
router.get('/subcategoria/:subcategoriaId', productoController.getProductosBySubcategoria);

//GET /api/producto/letras/:letras
router.get('/letras/:letras', productoController.getProductosByLetras);



//POST /api/producto
router.post('/', productoController.createProducto);

//PUT /api/producto
router.put('/', productoController.updateProducto);

//DELETE /api/producto/:productoId
router.delete('/:productoId', productoController.deleteProducto);



module.exports = router;