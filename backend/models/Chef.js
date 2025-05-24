const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const chefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  divisionId: { type: String },
});

chefSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('Hashing password for chef:', this.email);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Chef', chefSchema);