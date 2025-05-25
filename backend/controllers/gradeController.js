const Grade = require('../models/Grade');

exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ name: 1 }); // Sort alphabetically
    res.status(200).json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createGrade = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const existingGrade = await Grade.findOne({ name });
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade name already exists' });
    }
    const grade = new Grade({ name, description });
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.updateGrade = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (name) {
      const existingGrade = await Grade.findOne({ name, _id: { $ne: req.params.id } });
      if (existingGrade) {
        return res.status(400).json({ message: 'Grade name already exists' });
      }
    }
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};