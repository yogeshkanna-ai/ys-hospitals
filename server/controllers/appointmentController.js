const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { sendAppointmentConfirmation, sendCancellationEmail } = require('../config/email');

// @desc    Book appointment
// @route   POST /api/appointments
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book past dates.' });
    }

    const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if slot is available in doctor's schedule
    const daySchedule = doctor.availableSlots.find(d => d.day === dayName);
    if (!daySchedule) {
      return res.status(400).json({ success: false, message: `Doctor is not available on ${dayName}.` });
    }

    const slot = daySchedule.slots.find(s => s.time === timeSlot);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ success: false, message: 'This time slot is not available.' });
    }

    // Check for double booking
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      },
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked.' });
    }

    const user = req.user;

    const appointment = await Appointment.create({
      userId: user._id,
      doctorId,
      date: normalizedDate,
      timeSlot,
      dayOfWeek: dayName,
      reason,
      patientName: user.name,
      patientEmail: user.email,
      patientPhone: user.phone || '',
      doctorName: doctor.name,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee
    });

    // Send confirmation email (non-blocking)
    sendAppointmentConfirmation({
      to: user.email,
      patientName: user.name,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: normalizedDate,
      timeSlot,
      appointmentId: appointment._id
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Confirmation email sent.',
      appointment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This slot is already taken.' });
    }
    next(error);
  }
};

// @desc    Get my appointments
// @route   GET /api/appointments/my
exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('doctorId', 'name specialization avatar consultationFee')
      .sort({ date: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booked slots for a doctor on a date
// @route   GET /api/appointments/booked-slots?doctorId=&date=
exports.getBookedSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required.' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    const bookedSlots = appointments.map(a => a.timeSlot);
    res.json({ success: true, bookedSlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Only owner or admin can cancel
    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment.' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Send cancellation email
    sendCancellationEmail({
      to: appointment.patientEmail,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: appointment.date,
      timeSlot: appointment.timeSlot
    });

    res.json({ success: true, message: 'Appointment cancelled.', appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin - Get all appointments
// @route   GET /api/appointments/admin/all
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date } = req.query;
    let query = {};
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin - Analytics
// @route   GET /api/appointments/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      totalPatients,
      totalDoctors,
      revenueData
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$consultationFee' } } }
      ])
    ]);

    // Monthly bookings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top doctors by appointment count
    const topDoctors = await Appointment.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$doctorId', count: { $sum: 1 }, doctorName: { $first: '$doctorName' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        totalPatients,
        totalDoctors,
        totalRevenue: revenueData[0]?.total || 0,
        monthlyTrend,
        topDoctors
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin - Update appointment status
// @route   PUT /api/appointments/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Status updated.', appointment });
  } catch (error) {
    next(error);
  }
};
