const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  // Either YouTube ID or uploaded video URL
  videoId: { type: String, default: '' },       // YouTube video ID
  videoUrl: { type: String, default: '' },       // Uploaded video path
  videoType: { type: String, enum: ['youtube', 'upload'], default: 'youtube' }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, default: 'Priyanka Khinchi' },
  // Preview - YouTube or uploaded
  previewVideoId: { type: String, default: '' },
  previewVideoUrl: { type: String, default: '' },
  previewType: { type: String, enum: ['youtube', 'upload'], default: 'youtube' },
  lessons: [lessonSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalRevenue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
