const Chef = require('../models/Chef');

exports.createChef = async (req, res) => {
  const { name, email, divisionId } = req.body;
  try {
    const chef = new Chef({ name, email, divisionId });
    await chef.save();
    res.status(201).json(chef);
  } catch (error) {
    console.error('Create chef error:', error);
    res.status(400).json({ message: 'Invalid data' });
  }
};