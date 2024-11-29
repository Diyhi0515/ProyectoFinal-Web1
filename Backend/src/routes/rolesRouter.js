const express = require('express');
const router = express.Router();

const rolesController = require('../controllers/rolesController');

//GET /api/roles
router.get('/', rolesController.getRoles);

//GET /api/roles/:roleId
router.get('/:rolId', rolesController.getRolById);

//POST /api/roles
router.post('/', rolesController.createRol);

//PUT /api/roles
router.put('/', rolesController.updateRol);

//DELETE /api/roles/:roleId
router.delete('/:roleId', rolesController.deleteRol);

module.exports = router;