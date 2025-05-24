const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

router.get('/', authMiddleware(['admin']), getEmployees);
router.get('/:id', authMiddleware(['admin']), getEmployee);
router.post('/', authMiddleware(['admin']), createEmployee);
router.put('/:id', authMiddleware(['admin']), updateEmployee);
router.delete('/:id', authMiddleware(['admin']), deleteEmployee);

module.exports = router;