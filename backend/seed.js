const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const Division = require('./models/Division');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/employee_management');

    // Clear non-admin data
    await Employee.deleteMany({});
    await Division.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } }); // Preserve admin user

    // Check or update admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    const newPasswordHash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash for admin123:', newPasswordHash); // Debug hash

    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: newPasswordHash,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created: email=admin@example.com, password hash=', newPasswordHash);
    } else {
      // Test the current password
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log('Current password matches admin123:', isMatch);
      if (!isMatch) {
        admin.password = newPasswordHash;
        await admin.save();
        console.log('Admin password updated to match admin123, new hash=', newPasswordHash);
      } else {
        console.log('Admin password already matches admin123, no update needed');
      }
    }

    // Seed employees and divisions (same as before)
    const employees = [
      // ... (your employee array)
    ];

    const insertedEmployees = await Employee.insertMany(employees);

    const divisions = [
      // ... (your division array)
    ];

    await Division.insertMany(divisions);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();