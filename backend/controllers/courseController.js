const Course = require('../models/Course');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

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
      safeCourse.lessons = safeCourse.lessons.map(l => ({
        title: l.title, duration: l.duration, _id: l._id, videoType: l.videoType
      }));
      return res.json({ ...safeCourse, isPaid: false });
    }
    res.json({ ...course.toObject(), isPaid: true });
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

// Teacher: Create course with optional thumbnail upload
const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, previewVideoId, previewType, thumbnailUrl } = req.body;
    if (!title || !description || !price || !category)
      return res.status(400).json({ message: 'Title, description, price, category required' });

    let thumbnail = thumbnailUrl || '';
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }
    if (!thumbnail) return res.status(400).json({ message: 'Thumbnail is required' });

    const course = await Course.create({
      title, description,
      price: Number(price),
      thumbnail,
      category,
      previewVideoId: previewVideoId || '',
      previewType: previewType || 'youtube',
      lessons: []
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Upload preview video for course
const uploadPreviewVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Delete old uploaded preview if exists
    if (course.previewType === 'upload' && course.previewVideoUrl) {
      const oldPath = path.join(__dirname, '..', course.previewVideoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    course.previewVideoUrl = `/uploads/videos/${req.file.filename}`;
    course.previewType = 'upload';
    course.previewVideoId = '';
    await course.save();
    res.json({ message: 'Preview video uploaded', previewVideoUrl: course.previewVideoUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Add lesson with video upload or YouTube
const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, duration, videoId, videoType } = req.body;
    if (!title) return res.status(400).json({ message: 'Lesson title required' });

    const lesson = { title, duration: duration || '', videoType: videoType || 'youtube' };

    if (req.file) {
      lesson.videoUrl = `/uploads/videos/${req.file.filename}`;
      lesson.videoType = 'upload';
      lesson.videoId = '';
    } else {
      lesson.videoId = videoId || '';
      lesson.videoUrl = '';
    }

    course.lessons.push(lesson);
    await course.save();
    res.json({ message: 'Lesson added', lesson: course.lessons[course.lessons.length - 1] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Delete a lesson
const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Delete uploaded video file
    if (lesson.videoType === 'upload' && lesson.videoUrl) {
      const filePath = path.join(__dirname, '..', lesson.videoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    course.lessons.pull(req.params.lessonId);
    await course.save();
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Update course details
const updateCourse = async (req, res) => {
  try {
    const { title, description, price, category, previewVideoId, previewType, thumbnailUrl } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (title) course.title = title;
    if (description) course.description = description;
    if (price) course.price = Number(price);
    if (category) course.category = category;
    if (previewVideoId !== undefined) course.previewVideoId = previewVideoId;
    if (previewType) course.previewType = previewType;
    if (thumbnailUrl) course.thumbnail = thumbnailUrl;
    if (req.file) course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;

    await course.save();
    res.json(course);
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
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Delete all uploaded lesson videos
    for (const lesson of course.lessons) {
      if (lesson.videoType === 'upload' && lesson.videoUrl) {
        const filePath = path.join(__dirname, '..', lesson.videoUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCourses, getCourseById, getMyEnrolledCourses,
  createCourse, updateCourse, uploadPreviewVideo,
  addLesson, deleteLesson,
  getDashboard, deleteCourse
};
