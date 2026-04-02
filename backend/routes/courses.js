const express = require('express');
const router = express.Router();
const { protect, optionalAuth, teacherOnly, studentOnly } = require('../middleware/auth');
const {
  getAllCourses, getCourseById, enrollCourse,
  getMyEnrolledCourses, createCourse, getDashboard, deleteCourse
} = require('../controllers/courseController');

// Public
router.get('/', getAllCourses);

// Authenticated (any role)
router.get('/my-courses', protect, studentOnly, getMyEnrolledCourses);
router.get('/:id', optionalAuth, getCourseById);

// Student only
router.post('/:id/enroll', protect, studentOnly, enrollCourse);

// Teacher only
router.post('/', protect, teacherOnly, createCourse);
router.delete('/:id', protect, teacherOnly, deleteCourse);
router.get('/teacher/dashboard', protect, teacherOnly, getDashboard);

module.exports = router;
