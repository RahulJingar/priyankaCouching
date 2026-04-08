const Course = require('./models/Course');
const User = require('./models/User');
const mongoose = require('mongoose');

const seedData = async () => {
  const count = await Course.countDocuments();
  if (count > 0) return;

  const courses = [
    {
      title: 'Complete Mathematics for Class 10',
      description: 'Master all Class 10 Math concepts with detailed explanations, practice problems, and exam strategies. Covers Algebra, Geometry, Trigonometry, and Statistics.',
      price: 1999,
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
      category: 'Mathematics',
      previewVideoId: 'NybHckSEQBI', previewType: 'youtube',
      lessons: [
        { title: 'Real Numbers - Introduction', videoId: 'NybHckSEQBI', videoType: 'youtube', duration: '45 min' },
        { title: 'Polynomials - Basics & Advanced', videoId: 'mAlSbSXUnRg', videoType: 'youtube', duration: '52 min' },
        { title: 'Linear Equations in Two Variables', videoId: 'Vc9oCFMFBMk', videoType: 'youtube', duration: '48 min' },
        { title: 'Quadratic Equations', videoId: 'IlNAJl36-10', videoType: 'youtube', duration: '55 min' },
        { title: 'Arithmetic Progressions', videoId: 'gua96ju_FBk', videoType: 'youtube', duration: '40 min' },
        { title: 'Triangles & Similarity', videoId: 'KIMqHMnFMRY', videoType: 'youtube', duration: '60 min' },
      ]
    },
    {
      title: 'Physics Mastery - Class 11 & 12',
      description: 'Complete Physics course for Class 11 & 12 students. Covers Mechanics, Thermodynamics, Electrostatics, Optics, and Modern Physics with solved examples.',
      price: 2499,
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600',
      category: 'Physics',
      previewVideoId: 'ZM8ECpBuQYE', previewType: 'youtube',
      lessons: [
        { title: 'Units & Measurements', videoId: 'ZM8ECpBuQYE', videoType: 'youtube', duration: '38 min' },
        { title: 'Motion in a Straight Line', videoId: 'wWnfJ0-xXRE', videoType: 'youtube', duration: '50 min' },
        { title: 'Laws of Motion - Newton', videoId: 'kKKM8Y-u7ds', videoType: 'youtube', duration: '55 min' },
        { title: 'Work, Energy & Power', videoId: 'w4QFJb9a8vo', videoType: 'youtube', duration: '48 min' },
        { title: 'Gravitation', videoId: 'MTY1Kje0yLg', videoType: 'youtube', duration: '45 min' },
        { title: 'Electrostatics - Coulombs Law', videoId: 'x1-SibwIPM4', videoType: 'youtube', duration: '52 min' },
      ]
    },
    {
      title: 'Chemistry Complete Course - JEE/NEET',
      description: 'Comprehensive Chemistry preparation for JEE and NEET aspirants. Physical, Organic, and Inorganic Chemistry with shortcuts and tricks.',
      price: 2999,
      thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600',
      category: 'Chemistry',
      previewVideoId: 'FSyAehMdpyI', previewType: 'youtube',
      lessons: [
        { title: 'Some Basic Concepts of Chemistry', videoId: 'FSyAehMdpyI', videoType: 'youtube', duration: '42 min' },
        { title: 'Structure of Atom', videoId: 'thnDxFdkzZs', videoType: 'youtube', duration: '58 min' },
        { title: 'Chemical Bonding', videoId: 'QXT4OLQX1AE', videoType: 'youtube', duration: '65 min' },
        { title: 'Thermodynamics', videoId: 'SZorAJ4I-sA', videoType: 'youtube', duration: '50 min' },
        { title: 'Organic Chemistry - Basics', videoId: 'bSMx0NS0XfY', videoType: 'youtube', duration: '55 min' },
      ]
    },
    {
      title: 'English Grammar & Writing Skills',
      description: 'Improve your English grammar, vocabulary, and writing skills. Perfect for school students and competitive exam preparation.',
      price: 999,
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
      category: 'English',
      previewVideoId: 'fgRbqf_5tnQ', previewType: 'youtube',
      lessons: [
        { title: 'Parts of Speech', videoId: 'fgRbqf_5tnQ', videoType: 'youtube', duration: '35 min' },
        { title: 'Tenses - Complete Guide', videoId: 'Vc9oCFMFBMk', videoType: 'youtube', duration: '48 min' },
        { title: 'Active & Passive Voice', videoId: 'NybHckSEQBI', videoType: 'youtube', duration: '40 min' },
        { title: 'Essay Writing Techniques', videoId: 'mAlSbSXUnRg', videoType: 'youtube', duration: '45 min' },
      ]
    },
    {
      title: 'Biology for NEET - Complete Preparation',
      description: 'Full Biology course designed for NEET aspirants. Covers Botany and Zoology with NCERT-based explanations and previous year questions.',
      price: 2799,
      thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
      category: 'Biology',
      previewVideoId: 'URUJD5NEXC8', previewType: 'youtube',
      lessons: [
        { title: 'Cell - The Unit of Life', videoId: 'URUJD5NEXC8', videoType: 'youtube', duration: '55 min' },
        { title: 'Biomolecules', videoId: 'H8WJ2KENlK0', videoType: 'youtube', duration: '60 min' },
        { title: 'Photosynthesis', videoId: 'uixA8ZXx0KU', videoType: 'youtube', duration: '50 min' },
        { title: 'Human Physiology - Digestion', videoId: 'Og5xAdC8EUI', videoType: 'youtube', duration: '58 min' },
        { title: 'Genetics & Evolution', videoId: 'CBezq1fFUEA', videoType: 'youtube', duration: '65 min' },
      ]
    },
    {
      title: 'Computer Science - Python Programming',
      description: 'Learn Python programming from scratch. Covers basics to advanced topics including data structures, OOP, and project development.',
      price: 1499,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
      category: 'Computer Science',
      previewVideoId: '_uQrJ0TkZlc', previewType: 'youtube',
      lessons: [
        { title: 'Python Introduction & Setup', videoId: '_uQrJ0TkZlc', videoType: 'youtube', duration: '30 min' },
        { title: 'Variables & Data Types', videoId: 'kqtD5dpn9C8', videoType: 'youtube', duration: '40 min' },
        { title: 'Control Flow - If/Else & Loops', videoId: 'DZwmZ8Usvnk', videoType: 'youtube', duration: '45 min' },
        { title: 'Functions & Modules', videoId: '9Os0o3wzS_I', videoType: 'youtube', duration: '50 min' },
        { title: 'Object Oriented Programming', videoId: 'JeznW_7DlB0', videoType: 'youtube', duration: '60 min' },
      ]
    }
  ];

  await Course.insertMany(courses);
  console.log('✅ Sample courses seeded');
};

module.exports = seedData;
