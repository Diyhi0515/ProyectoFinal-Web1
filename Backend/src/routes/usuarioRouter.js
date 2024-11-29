const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');


//POST /api/usuario/login
router.post('/login', usuarioController.login);

//POST /api/usuario
router.post('/', usuarioController.createCliente);

//PUT /api/usuario
router.put('/', usuarioController.updateUser);

//GET /api/usuario/ID
router.get('/:id', usuarioController.getUsuarioById);

module.exports = router;