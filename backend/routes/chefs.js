const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createChef } = require('../controllers/chefController');

router.post('/', authMiddleware(['admin']), createChef);

module.exports = router;