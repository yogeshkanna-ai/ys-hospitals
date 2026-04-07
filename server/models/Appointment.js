const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [300, 'Reason cannot exceed 300 characters']
  },
  notes: {
    type: String,
    trim: true
  },
  patientName: { type: String },
  patientEmail: { type: String },
  patientPhone: { type: String },
  doctorName: { type: String },
  specialization: { type: String },
  consultationFee: { type: Number }
}, { timestamps: true });

// Compound index to prevent double booking
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
