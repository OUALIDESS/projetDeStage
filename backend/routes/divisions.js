const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getDivisions, getDivision, createDivision, updateDivision, deleteDivision } = require('../controllers/divisionController');

router.get('/', authMiddleware(['admin', 'chef']), getDivisions);
router.get('/:id', authMiddleware(['admin', 'chef']), getDivision);
router.post('/', authMiddleware(['admin', 'chef']), createDivision);
router.put('/:id', authMiddleware(['admin', 'chef']), updateDivision);
router.delete('/:id', authMiddleware(['admin', 'chef']), deleteDivision);

module.exports = router;