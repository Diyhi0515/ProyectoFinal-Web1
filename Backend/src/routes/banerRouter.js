const express = require('express');
const router = express.Router();

const banerController = require('../controllers/banerController');

//GET /api/baner
router.get('/', banerController.getBaners);

//GET /api/baner/:banerId
router.get('/:banerId', banerController.getBanerById);

module.exports = router;