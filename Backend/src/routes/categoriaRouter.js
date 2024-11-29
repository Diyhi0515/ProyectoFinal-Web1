const express = require('express');
const router = express.Router();

const categoriaController = require('../controllers/categoriaController');

//GET /api/categoria
router.get('/', categoriaController.getCategorias);

//GET /api/categoria/:categoriaId
router.get('/:categoriaId', categoriaController.getCategoriaById);

//POST /api/categoria
router.post('/', categoriaController.createCategoria);

//PUT /api/categoria
router.put('/', categoriaController.updateCategoria);

//DELETE /api/categoria/:categoriaId
router.delete('/:categoriaId', categoriaController.deleteCategoria);

module.exports = router;