const Doctor = require('../models/Doctor');
const { validationResult } = require('express-validator');

// @desc    Get all doctors (with search & filter)
// @route   GET /api/doctors
exports.getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, minFee, maxFee, minExp } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }
    if (minExp) query.experience = { $gte: Number(minExp) };

    const doctors = await Doctor.find(query).sort({ rating: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Add doctor (admin)
// @route   POST /api/doctors
exports.addDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Build default slots for all days
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const defaultTimes = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                          '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

    const availableSlots = days.map(day => ({
      day,
      slots: defaultTimes.map(time => ({ time, isAvailable: true }))
    }));

    const doctor = await Doctor.create({ ...req.body, availableSlots });
    res.status(201).json({ success: true, message: 'Doctor added successfully!', doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor (admin)
// @route   PUT /api/doctors/:id
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor updated!', doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor (admin)
// @route   DELETE /api/doctors/:id
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all specializations (unique)
// @route   GET /api/doctors/specializations
exports.getSpecializations = async (req, res, next) => {
  try {
    const specs = await Doctor.distinct('specialization', { isActive: true });
    res.json({ success: true, specializations: specs });
  } catch (error) {
    next(error);
  }
};
