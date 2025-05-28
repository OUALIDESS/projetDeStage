const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chef = require('../models/Chef');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    let user = await User.findOne({ email });
    console.log('User lookup:', user ? { _id: user._id, email: user.email, role: user.role } : null);

    let isChef = false;
    if (!user) {
      user = await Chef.findOne({ email });
      console.log('Chef lookup:', user ? { _id: user._id, email: user.email } : null);
      isChef = true;
    }

    if (!user) {
      console.log('No user or chef found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = isChef ? await bcrypt.compare(password, user.password) : await user.matchPassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const role = isChef ? 'chef' : user.role;
    
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET
    );
    console.log('Token generated for:', { id: user._id, role });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login };