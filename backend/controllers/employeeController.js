const Employee = require('../models/Employee');
const mongoose = require('mongoose');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('divisionId');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createEmployee = async (req, res) => {
  console.log('Create request received:', req.body);
  const {
    nomComplet,
    dateNaissance,
    sexe,
    grade,
    dateRecrutement,
    diplome,
    affectation,
    situationFamiliale,
    missionPoste,
    formationInitiale,
    activitePrincipale,
    cin,
    ppr,
    adresse,
    email,
    numeroTelephone,
    experienceExterne,
    experienceInterne,
    divisionId,
    informationsSupplementaires,
    image, // Base64 string
    anciennete,
  } = req.body;

  if (!nomComplet || !email || !divisionId || !sexe || !dateRecrutement) {
    return res.status(400).json({ message: 'Fields nomComplet, email, divisionId, sexe, and dateRecrutement are required' });
  }

  // Optional validation for image
  if (image && !image.startsWith('data:image/jpeg;base64,')) {
    return res.status(400).json({ message: 'Image must be a valid JPEG base64 string' });
  }

  try {
    const employee = new Employee({
      nomComplet,
      dateNaissance,
      sexe,
      grade,
      dateRecrutement,
      diplome,
      affectation,
      situationFamiliale,
      missionPoste,
      formationInitiale,
      activitePrincipale,
      cin,
      ppr,
      adresse,
      email,
      numeroTelephone,
      experienceExterne,
      experienceInterne,
      divisionId,
      informationsSupplementaires: informationsSupplementaires || [],
      image: image || '', // Store base64 string
      anciennete: anciennete || 0,
    });

    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('Update data received:', updateData);

    // Optional validation for image
    if (updateData.image && !updateData.image.startsWith('data:image/jpeg;base64,')) {
      return res.status(400).json({ message: 'Image must be a valid JPEG base64 string' });
    }

    const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('divisionId');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// New searchEmployees function
const searchEmployees = async (req, res) => {
  try {
    const { query, grade, divisionId, excludeId } = req.query;
    const searchCriteria = {};
    
    if (query) {
      searchCriteria.nomComplet = { $regex: query, $options: 'i' };
    }
    if (grade) {
      searchCriteria.grade = { $in: grade.split(',') };
    }
    if (divisionId) {
      searchCriteria.divisionId = mongoose.Types.ObjectId.isValid(divisionId)
        ? mongoose.Types.ObjectId(divisionId)
        : divisionId;
    }
    if (excludeId) {
      searchCriteria._id = { $ne: excludeId };
    }

    const employees = await Employee.find(searchCriteria, 'nomComplet divisionId grade')
      .populate('divisionId', 'name');
    console.log('Search query:', { query, grade, divisionId, excludeId }, 'Results:', employees);
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error searching employees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, searchEmployees };