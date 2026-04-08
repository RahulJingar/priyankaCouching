const express = require('express');
const router = express.Router();
const { protect, studentOnly } = require('../middleware/auth');
const { createOrder, verifyPayment, demoEnroll } = require('../controllers/paymentController');

router.post('/create-order/:courseId', protect, studentOnly, createOrder);
router.post('/verify', protect, studentOnly, verifyPayment);
router.post('/demo-enroll', protect, studentOnly, demoEnroll);

module.exports = router;
