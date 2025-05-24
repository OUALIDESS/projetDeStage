const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Division = require('./models/Division');
const User = require('./models/User');
require('dotenv').config();

const verifyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-management');
    console.log('Users:', await User.countDocuments());
    console.log('Employees:', await Employee.countDocuments());
    console.log('Divisions:', await Division.countDocuments());
    console.log('Admin User:', await User.findOne({ email: 'admin@example.com' }));
    console.log('Sample Employee:', await Employee.findOne());
    console.log('Sample Division:', await Division.findOne());
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

verifyData();