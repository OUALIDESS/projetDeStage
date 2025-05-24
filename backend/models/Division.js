const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  currentProject: { type: String },
  employeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
});

module.exports = mongoose.model('Division', divisionSchema);