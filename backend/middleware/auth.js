const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'teacher') {
      req.user = { id: 'teacher', role: 'teacher', name: 'Priyanka Khinchi', email: process.env.TEACHER_EMAIL };
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'teacher') {
      req.user = { id: 'teacher', role: 'teacher', name: 'Priyanka Khinchi', email: process.env.TEACHER_EMAIL };
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {}
  next();
};

const teacherOnly = (req, res, next) => {
  if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Teacher access only' });
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user?.role !== 'student') return res.status(403).json({ message: 'Student access only' });
  next();
};

module.exports = { protect, optionalAuth, teacherOnly, studentOnly };
