const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, default: 'Priyanka Khinchi' },
  previewVideoId: { type: String, required: true },   // YouTube video ID - free preview
  lessons: [
    {
      title: { type: String, required: true },
      videoId: { type: String, required: true },      // YouTube video ID - paid content
      duration: { type: String }
    }
  ],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalRevenue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
