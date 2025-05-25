const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(['admin', 'chef']), divisionController.getDivisions);
router.get('/employees', authMiddleware(['admin', 'chef']), divisionController.getEmployees);
router.get('/search', authMiddleware(['admin', 'chef']), divisionController.searchEmployees);
router.get('/:id', authMiddleware(['admin', 'chef']), divisionController.getDivision);
router.post('/', authMiddleware(['admin']), divisionController.createDivision);
router.put('/:id', authMiddleware(['admin']), divisionController.updateDivision);
router.delete('/:id', authMiddleware(['admin']), divisionController.deleteDivision);

module.exports = router;