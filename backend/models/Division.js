const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentProject: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  isSeeded: { type: Boolean, default: false }, // New field to mark seeded divisions
});

module.exports = mongoose.model('Division', divisionSchema);