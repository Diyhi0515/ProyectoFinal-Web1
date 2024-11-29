const express = require('express');
const router = express.Router();

const subcategoriaController = require('../controllers/subcategoriaController');

// GET /api/subcategoria
router.get('/', subcategoriaController.getSubcategorias);

// GET /api/subcategoria/123
router.get('/:subcategoriaId', subcategoriaController.getSubcategoriaById);

// GET /api/subcategoria/categoria/123
router.get('/categoria/:categoriaId', subcategoriaController.getSubcategoriasByCategoria);

// POST /api/subcategoria
router.post('/', subcategoriaController.createSubcategoria);

// PUT /api/subcategoria
router.put('/', subcategoriaController.updateSubcategoria);

// DELETE /api/subcategoria/123
router.delete('/:subcategoriaId', subcategoriaController.deleteSubcategoria);


module.exports = router;