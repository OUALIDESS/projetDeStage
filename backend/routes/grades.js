const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(['admin', 'chef']), gradeController.getGrades);
router.post('/', authMiddleware(['admin']), gradeController.createGrade);
router.put('/:id', authMiddleware(['admin']), gradeController.updateGrade);
router.delete('/:id', authMiddleware(['admin']), gradeController.deleteGrade);

module.exports = router;