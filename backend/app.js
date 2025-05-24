const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const chefRoutes = require('./routes/chefs');
const divisionRoutes = require('./routes/divisions');
const employeeRoutes = require('./routes/employees');
const gradeRoutes = require('./routes/grades');

const app = express();

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
  res.sendStatus(204);
});

// Parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/grades', gradeRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27018/employee_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;