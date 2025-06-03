const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, searchEmployees } = require('../controllers/employeeController');

router.get('/', authMiddleware(['admin']), getAllEmployees);
router.post('/', authMiddleware(['admin']), createEmployee);
router.put('/:id', authMiddleware(['admin']), updateEmployee);
router.delete('/:id', authMiddleware(['admin']), deleteEmployee);


router.get('/search', authMiddleware(['admin']), searchEmployees);

module.exports = router;