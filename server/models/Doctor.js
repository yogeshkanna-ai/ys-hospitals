const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true
  },
  slots: [{
    time: { type: String, required: true }, // e.g. "09:00 AM"
    isAvailable: { type: Boolean, default: true }
  }]
});

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  availableSlots: [timeSlotSchema],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hospital: {
    type: String,
    default: "Y's Hospitals"
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
