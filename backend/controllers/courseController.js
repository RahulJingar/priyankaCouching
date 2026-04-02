const Course = require('../models/Course');
const User = require('../models/User');

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('-lessons -enrolledStudents');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('-enrolledStudents');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isPaid = req.user?.role === 'teacher' ||
      (req.user?.enrolledCourses?.some(id => id.toString() === course._id.toString()));

    if (!isPaid) {
      const safeCourse = course.toObject();
      safeCourse.lessons = safeCourse.lessons.map(l => ({ title: l.title, duration: l.duration, _id: l._id }));
      return res.json({ ...safeCourse, isPaid: false });
    }
    res.json({ ...course.toObject(), isPaid: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.map(id => id.toString()).includes(course._id.toString()))
      return res.status(400).json({ message: 'Already enrolled' });

    user.enrolledCourses.push(course._id);
    await user.save();

    course.enrolledStudents.push(user._id);
    course.totalRevenue += course.price;
    await course.save();

    res.json({ message: 'Enrolled successfully', courseId: course._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses', '-enrolledStudents');
    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, price, thumbnail, category, previewVideoId, lessons } = req.body;
    if (!title || !description || !price || !thumbnail || !previewVideoId)
      return res.status(400).json({ message: 'All required fields must be filled' });
    const course = await Course.create({ title, description, price, thumbnail, category, previewVideoId, lessons });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const courses = await Course.find().populate('enrolledStudents', 'name email createdAt');
    const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalStudents = await User.countDocuments({ role: 'student' });
    res.json({ courses, totalRevenue, totalStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllCourses, getCourseById, enrollCourse, getMyEnrolledCourses, createCourse, getDashboard, deleteCourse };
