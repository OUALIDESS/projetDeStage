const Employee = require('../models/Employee');

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
  } = req.body;

  if (!nomComplet || !email || !divisionId || !sexe || !dateRecrutement) {
    return res.status(400).json({ message: 'Fields nomComplet, email, divisionId, sexe, and dateRecrutement are required' });
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

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };