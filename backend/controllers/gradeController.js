const Grade = require('../models/Grade');

exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateGrade = async (req, res) => {
  const { name, description } = req.body;
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json(grade);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};