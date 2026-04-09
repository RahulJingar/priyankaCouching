const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.map(id => id.toString()).includes(course._id.toString()))
      return res.status(400).json({ message: 'Already enrolled in this course' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: course.price * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId)
      return res.status(400).json({ message: 'Missing payment details' });

    // Signature verify karo
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid payment signature. Payment not verified.' });

    // Razorpay se payment status confirm karo
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    console.log('Payment status:', payment.status, '| Amount:', payment.amount, '| Method:', payment.method);

    if (payment.status !== 'captured' && payment.status !== 'authorized')
      return res.status(400).json({ message: `Payment not completed. Status: ${payment.status}` });

    // Order verify karo
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (order.status !== 'paid')
      return res.status(400).json({ message: 'Order not paid yet.' });

    // Enroll student
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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
