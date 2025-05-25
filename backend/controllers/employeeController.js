const Employee = require('../models/Employee');
const Division = require('../models/Division');

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('divisionId', 'name');
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single employee by ID
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('divisionId', 'name');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const {
      nomComplet, grade, missionPoste, email, dateNaissance, sexe, dateRecrutement,
      diplome, affectation, situationFamiliale, formationInitiale, activitePrincipale,
      cin, ppr, adresse, numeroTelephone, experienceExterne, experienceInterne,
      typeContrat, divisionId, supplementaryInfo
    } = req.body;
    if (!nomComplet || !divisionId) {
      return res.status(400).json({ message: 'Name and division are required' });
    }
    const employee = new Employee({
      nomComplet, grade, missionPoste, email, dateNaissance, sexe, dateRecrutement,
      diplome, affectation, situationFamiliale, formationInitiale, activitePrincipale,
      cin, ppr, adresse, numeroTelephone, experienceExterne, experienceInterne,
      typeContrat, divisionId, supplementaryInfo
    });
    await employee.save();
    if (employee.divisionId) {
      await Division.findByIdAndUpdate(employee.divisionId, {
        $push: { employeeIds: employee._id },
      });
    }
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(400).json({ message: 'Failed to create employee', error: err.message });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const oldDivisionId = employee.divisionId;

    // Update only provided fields
    const {
      nomComplet, grade, missionPoste, email, dateNaissance, sexe, dateRecrutement,
      diplome, affectation, situationFamiliale, formationInitiale, activitePrincipale,
      cin, ppr, adresse, numeroTelephone, experienceExterne, experienceInterne,
      typeContrat, divisionId, supplementaryInfo
    } = req.body;

    // Validate required fields
    if (nomComplet !== undefined && !nomComplet) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (divisionId !== undefined && !divisionId) {
      return res.status(400).json({ message: 'Division is required' });
    }

    // Update fields if provided
    employee.nomComplet = nomComplet !== undefined ? nomComplet : employee.nomComplet;
    employee.grade = grade !== undefined ? grade : employee.grade;
    employee.missionPoste = missionPoste !== undefined ? missionPoste : employee.missionPoste;
    employee.email = email !== undefined ? email : employee.email;
    employee.dateNaissance = dateNaissance !== undefined ? dateNaissance : employee.dateNaissance;
    employee.sexe = sexe !== undefined ? sexe : employee.sexe;
    employee.dateRecrutement = dateRecrutement !== undefined ? dateRecrutement : employee.dateRecrutement;
    employee.diplome = diplome !== undefined ? diplome : employee.diplome;
    employee.affectation = affectation !== undefined ? affectation : employee.affectation;
    employee.situationFamiliale = situationFamiliale !== undefined ? situationFamiliale : employee.situationFamiliale;
    employee.formationInitiale = formationInitiale !== undefined ? formationInitiale : employee.formationInitiale;
    employee.activitePrincipale = activitePrincipale !== undefined ? activitePrincipale : employee.activitePrincipale;
    employee.cin = cin !== undefined ? cin : employee.cin;
    employee.ppr = ppr !== undefined ? ppr : employee.ppr;
    employee.adresse = adresse !== undefined ? adresse : employee.adresse;
    employee.numeroTelephone = numeroTelephone !== undefined ? numeroTelephone : employee.numeroTelephone;
    employee.experienceExterne = experienceExterne !== undefined ? experienceExterne : employee.experienceExterne;
    employee.experienceInterne = experienceInterne !== undefined ? experienceInterne : employee.experienceInterne;
    employee.typeContrat = typeContrat !== undefined ? typeContrat : employee.typeContrat;
    employee.divisionId = divisionId !== undefined ? divisionId : employee.divisionId;
    employee.supplementaryInfo = supplementaryInfo !== undefined ? supplementaryInfo : employee.supplementaryInfo;

    await employee.save();

    // Update Division.employeeIds if divisionId changed
    if (divisionId !== undefined && oldDivisionId !== divisionId) {
      if (oldDivisionId) {
        await Division.findByIdAndUpdate(oldDivisionId, {
          $pull: { employeeIds: employee._id },
        });
      }
      if (divisionId) {
        await Division.findByIdAndUpdate(divisionId, {
          $push: { employeeIds: employee._id },
        });
      }
    }

    const updatedEmployee = await Employee.findById(employee._id).populate('divisionId', 'name');
    res.status(200).json(updatedEmployee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(400).json({ message: 'Failed to update employee', error: err.message });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.divisionId) {
      await Division.findByIdAndUpdate(employee.divisionId, {
        $pull: { employeeIds: employee._id },
      });
    }
    await Employee.deleteOne({ _id: employee._id });
    res.status(200).json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(400).json({ message: 'Failed to delete employee', error: err.message });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};