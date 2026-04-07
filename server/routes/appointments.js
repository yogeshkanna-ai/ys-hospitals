const express = require('express');
const router = express.Router();
const {
  bookAppointment, getMyAppointments, getBookedSlots,
  cancelAppointment, getAllAppointments, getAnalytics, updateStatus
} = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/booked-slots', protect, getBookedSlots);
router.get('/my', protect, getMyAppointments);
router.post('/', protect, bookAppointment);
router.put('/:id/cancel', protect, cancelAppointment);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllAppointments);
router.get('/admin/analytics', protect, adminOnly, getAnalytics);
router.put('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
