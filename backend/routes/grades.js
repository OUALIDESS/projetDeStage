const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getGrades, updateGrade } = require('../controllers/gradeController');

router.get('/', authMiddleware(['admin', 'chef']), getGrades);
router.put('/:id', authMiddleware(['admin', 'chef']), updateGrade);


module.exports = router;