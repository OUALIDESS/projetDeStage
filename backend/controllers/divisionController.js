const Division = require('../models/Division');
const Employee = require('../models/Employee');

exports.getDivisions = async (req, res) => {
  try {
    const divisions = await Division.find()
      .populate('managerId', 'nomComplet')
      .populate('employeeIds', 'nomComplet');
    const formattedDivisions = divisions.map(d => ({
      id: d._id,
      division: d.name,
      manager: d.managerId ? d.managerId.nomComplet : '',
      currentProject: d.currentProject,
      employees: d.employeeIds.map(e => e.nomComplet),
    }));
    res.json(formattedDivisions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDivision = async (req, res) => {
  try {
    const division = await Division.findById(req.params.id)
      .populate('managerId', 'nomComplet')
      .populate('employeeIds', 'nomComplet');
    if (!division) return res.status(404).json({ message: 'Division not found' });
    const formattedDivision = {
      id: division._id,
      division: division.name,
      manager: division.managerId ? division.managerId.nomComplet : '',
      currentProject: division.currentProject,
      employees: division.employeeIds.map(e => e.nomComplet),
    };
    res.json(formattedDivision);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDivision = async (req, res) => {
  const { division, manager, currentProject, employees } = req.body;
  try {
    const managerEmployee = await Employee.findOne({ nomComplet: manager });
    if (!managerEmployee) return res.status(400).json({ message: 'Manager not found' });

    const employeeRecords = await Employee.find({ nomComplet: { $in: employees } });
    if (employeeRecords.length !== employees.length) return res.status(400).json({ message: 'Some employees not found' });

    const divisionData = new Division({
      name: division,
      managerId: managerEmployee._id,
      currentProject,
      employeeIds: employeeRecords.map(e => e._id),
    });
    await divisionData.save();

    const formattedDivision = {
      id: divisionData._id,
      division: divisionData.name,
      manager: managerEmployee.nomComplet,
      currentProject: divisionData.currentProject,
      employees: employeeRecords.map(e => e.nomComplet),
    };
    res.status(201).json(formattedDivision);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.updateDivision = async (req, res) => {
  const { division, manager, currentProject, employees } = req.body;
  try {
    const managerEmployee = await Employee.findOne({ nomComplet: manager });
    if (!managerEmployee) return res.status(400).json({ message: 'Manager not found' });

    const employeeRecords = await Employee.find({ nomComplet: { $in: employees } });
    if (employeeRecords.length !== employees.length) return res.status(400).json({ message: 'Some employees not found' });

    const divisionData = await Division.findByIdAndUpdate(
      req.params.id,
      {
        name: division,
        managerId: managerEmployee._id,
        currentProject,
        employeeIds: employeeRecords.map(e => e._id),
      },
      { new: true }
    ).populate('managerId', 'nomComplet').populate('employeeIds', 'nomComplet');
    if (!divisionData) return res.status(404).json({ message: 'Division not found' });

    const formattedDivision = {
      id: divisionData._id,
      division: divisionData.name,
      manager: divisionData.managerId ? divisionData.managerId.nomComplet : '',
      currentProject: divisionData.currentProject,
      employees: divisionData.employeeIds.map(e => e.nomComplet),
    };
    res.json(formattedDivision);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.deleteDivision = async (req, res) => {
  try {
    const division = await Division.findByIdAndDelete(req.params.id);
    if (!division) return res.status(404).json({ message: 'Division not found' });
    res.json({ message: 'Division deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};