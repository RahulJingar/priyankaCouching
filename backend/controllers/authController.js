const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (email.toLowerCase() === process.env.TEACHER_EMAIL)
      return res.status(400).json({ message: 'This email is reserved' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      token: generateToken(user._id, 'student'),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    // Teacher login
    if (email.toLowerCase() === process.env.TEACHER_EMAIL) {
      if (password !== process.env.TEACHER_PASSWORD)
        return res.status(401).json({ message: 'Invalid credentials' });
      return res.json({
        token: generateToken('teacher', 'teacher'),
        user: { id: 'teacher', name: 'Priyanka Khinchi', email: process.env.TEACHER_EMAIL, role: 'teacher' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: generateToken(user._id, 'student'),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, enrolledCourses: user.enrolledCourses }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

module.exports = { register, login };
