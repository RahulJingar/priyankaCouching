const express = require('express');
const router = express.Router();
const { protect, optionalAuth, teacherOnly, studentOnly } = require('../middleware/auth');
const { uploadVideo, uploadThumbnail } = require('../middleware/upload');
const {
  getAllCourses, getCourseById, getMyEnrolledCourses,
  createCourse, updateCourse, uploadPreviewVideo,
  addLesson, deleteLesson,
  getDashboard, deleteCourse
} = require('../controllers/courseController');

// Public
router.get('/', getAllCourses);

// Student
router.get('/my-courses', protect, studentOnly, getMyEnrolledCourses);

// Teacher dashboard - MUST be before /:id
router.get('/teacher/dashboard', protect, teacherOnly, getDashboard);

// Course by ID - optional auth
router.get('/:id', optionalAuth, getCourseById);

// Teacher - course CRUD
router.post('/', protect, teacherOnly, uploadThumbnail.single('thumbnailFile'), createCourse);
router.put('/:id', protect, teacherOnly, uploadThumbnail.single('thumbnailFile'), updateCourse);
router.delete('/:id', protect, teacherOnly, deleteCourse);

// Teacher - video upload
router.post('/:id/preview-video', protect, teacherOnly, uploadVideo.single('video'), uploadPreviewVideo);
router.post('/:id/lessons', protect, teacherOnly, uploadVideo.single('video'), addLesson);
router.delete('/:id/lessons/:lessonId', protect, teacherOnly, deleteLesson);

module.exports = router;
