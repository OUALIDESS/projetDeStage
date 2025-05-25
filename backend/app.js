require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const chefRoutes = require('./routes/chefs');
const divisionRoutes = require('./routes/divisions');
const employeeRoutes = require('./routes/employees');
const gradeRoutes = require('./routes/grades');

const app = express();

// Connect to MongoDB
connectDB();

// Debug: Log all registered routes
const debugRoutes = (path, middleware) => {
  console.log(`Registering route: ${path}`);
  return middleware;
};

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
  res.sendStatus(204);
});

app.use(express.json());

app.use('/api/auth', debugRoutes('/api/auth', authRoutes));
app.use('/api/chef', debugRoutes('/api/chef', chefRoutes));
app.use('/api/divisions', debugRoutes('/api/divisions', divisionRoutes));
app.use('/api/employees', debugRoutes('/api/employees', employeeRoutes));
app.use('/api/grades', debugRoutes('/api/grades', gradeRoutes));

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;