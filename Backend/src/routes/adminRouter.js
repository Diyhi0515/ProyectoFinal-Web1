const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const e = require('express');

//POST /api/admin/login
router.post('/login', adminController.login);

//POST /api/admin
router.post('/', adminController.createAdmin);

//GET /api/admin
router.get('/', adminController.getAdmins);

//GET /api/admin/123
router.get('/:usuarioId', adminController.getAdminById);

//PUT /api/admin
router.put('/', adminController.updateAdmin);

//DELETE /api/admin/123
router.delete('/:usuarioId', adminController.deleteAdmin);

module.exports = router;