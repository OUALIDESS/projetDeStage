const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

router.get('/', authMiddleware(['admin', 'chef']), getEmployees);

router.post('/', authMiddleware(['admin']), createEmployee);

router.put('/:id', authMiddleware(['admin']), updateEmployee);

router.delete('/:id', authMiddleware(['admin']), deleteEmployee);

module.exports = router;