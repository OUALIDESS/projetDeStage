const Division = require('../models/Division');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

exports.getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find()
      .populate('managerId', 'nomComplet grade missionPoste')
      .populate('employeeIds', 'nomComplet');
    res.status(200).json(divisions);
  } catch (err) {
    console.error('Error fetching divisions:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id)
      .populate('managerId', 'nomComplet grade missionPoste dateNaissance sexe email numeroTelephone dateRecrutement diplome affectation situationFamiliale formationInitiale activitePrincipale cin ppr adresse experienceExterne experienceInterne')
      .populate('employeeIds', 'nomComplet');
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    res.status(200).json(division);
  } catch (err) {
    console.error('Error fetching division:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDivisionByName = async (req, res) => {
  try {
    const division = await Division.findOne({ name: req.params.name })
      .populate('managerId', 'nomComplet grade missionPoste dateNaissance sexe email numeroTelephone dateRecrutement diplome affectation situationFamiliale formationInitiale activitePrincipale cin ppr adresse experienceExterne experienceInterne')
      .populate('employeeIds', 'nomComplet');
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    res.status(200).json(division);
  } catch (err) {
    console.error('Error fetching division by name:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createDivision = async (req, res) => {
  const { name, currentProject, managerId, employeeIds } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: 'Division name is required' });
    }
    const existingDivision = await Division.findOne({ name });
    if (existingDivision) {
      return res.status(400).json({ message: 'Division name must be unique' });
    }
    const division = new Division({ 
      name, 
      currentProject, 
      managerId, 
      employeeIds, 
      isSeeded: false
    });
    await division.save();
    res.status(201).json(division);
  } catch (err) {
    console.error('Error creating division:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

exports.updateDivision = async (req, res) => {
  const { managerId, employeeIds } = req.body;
  try {
    const division = await Division.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    // Allow updates to seeded divisions if the allowSeededUpdate header is set to 'true'
    if (division.isSeeded && req.headers.allowseededupdate !== 'true') {
      return res.status(403).json({ message: 'Cannot modify seeded divisions' });
    }
    if (managerId) {
      if (!employeeIds || !employeeIds.includes(managerId)) {
        return res.status(400).json({ message: 'Manager must be an employee of the division' });
      }
      division.managerId = managerId;
    } else {
      division.managerId = null;
    }
    if (employeeIds) {
      const validEmployees = await Employee.find({ _id: { $in: employeeIds } });
      if (validEmployees.length !== employeeIds.length) {
        return res.status(400).json({ message: 'Invalid employee IDs' });
      }
      division.employeeIds = employeeIds;
    }
    await division.save();
    const updatedDivision = await Division.findById(req.params.id)
      .populate('managerId', 'nomComplet grade missionPoste dateNaissance sexe email numeroTelephone dateRecrutement diplome affectation situationFamiliale formationInitiale activitePrincipale cin ppr adresse experienceExterne experienceInterne')
      .populate('employeeIds', 'nomComplet grade');
    res.status(200).json(updatedDivision);
  } catch (err) {
    console.error('Error updating division:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

exports.deleteDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id).populate('employeeIds').populate('managerId');
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }
    if (division.isSeeded) {
      return res.status(403).json({ message: 'Cannot delete seeded divisions' });
    }
    if (division.employeeIds.length > 0 || division.managerId) {
      return res.status(400).json({ message: 'Cannot delete division with employees or a manager' });
    }
    await Division.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Division deleted' });
  } catch (err) {
    console.error('Error deleting division:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}, 'nomComplet divisionId grade sexe dateNaissance missionPoste affectation')
      .populate('divisionId', 'name'); // Populate divisionId with name
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.searchEmployees = async (req, res) => {
  try {
    const { query, grade, divisionId } = req.query;
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
    const employees = await Employee.find(searchCriteria, 'nomComplet divisionId grade')
      .populate('divisionId', 'name');
    console.log('Search query:', { query, grade, divisionId }, 'Results:', employees);
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error searching employees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};