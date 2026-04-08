const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');

const isRazorpayConfigured = () => {
  const key = process.env.RAZORPAY_KEY_ID || '';
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  return key.startsWith('rzp_') && !key.includes('xxx') && secret.length > 10 && !secret.includes('xxx');
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.map(id => id.toString()).includes(course._id.toString()))
      return res.status(400).json({ message: 'Already enrolled in this course' });

    // Demo mode - Razorpay keys nahi hain
    if (!isRazorpayConfigured()) {
      return res.json({
        demoMode: true,
        courseId: course._id,
        courseName: course.title,
        amount: course.price * 100,
        currency: 'INR'
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: course.price * 100,
      currency: 'INR',
      receipt: `receipt_${course._id}_${req.user.id}`,
      notes: { courseId: course._id.toString(), userId: req.user.id.toString() }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName: course.title,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Verify payment & enroll
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    // Enroll student
    const course = await Course.findById(courseId);
    const user = await User.findById(req.user.id);

    if (!user.enrolledCourses.map(id => id.toString()).includes(course._id.toString())) {
      user.enrolledCourses.push(course._id);
      await user.save();
      course.enrolledStudents.push(user._id);
      course.totalRevenue += course.price;
      await course.save();
    }

    res.json({ message: 'Payment verified & enrolled successfully', courseId });
  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Demo enroll - jab Razorpay keys nahi hain
const demoEnroll = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.id);
    if (!user.enrolledCourses.map(id => id.toString()).includes(course._id.toString())) {
      user.enrolledCourses.push(course._id);
      await user.save();
      course.enrolledStudents.push(user._id);
      course.totalRevenue += course.price;
      await course.save();
    }
    res.json({ message: 'Enrolled successfully', courseId: course._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, demoEnroll };
