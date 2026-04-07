require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const connectDB = require('./config/db');

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const defaultTimes = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                      '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

const availableSlots = days.map(day => ({
  day, slots: defaultTimes.map(time => ({ time, isAvailable: true }))
}));

const sampleDoctors = [
  { name: 'Aravind Sharma', specialization: 'Cardiologist', experience: 15, qualification: 'MBBS, MD (Cardiology)', bio: 'Expert in interventional cardiology and heart failure management.', email: 'aravind@yshospitals.com', phone: '9876543210', consultationFee: 800, rating: 4.8, totalReviews: 142 },
  { name: 'Priya Nair', specialization: 'Dermatologist', experience: 10, qualification: 'MBBS, MD (Dermatology)', bio: 'Specialist in skin disorders, cosmetic dermatology and hair loss treatment.', email: 'priya@yshospitals.com', phone: '9876543211', consultationFee: 600, rating: 4.7, totalReviews: 98 },
  { name: 'Rajesh Kumar', specialization: 'Orthopedic Surgeon', experience: 18, qualification: 'MBBS, MS (Orthopaedics)', bio: 'Expert in joint replacement, sports injuries and spine surgery.', email: 'rajesh@yshospitals.com', phone: '9876543212', consultationFee: 900, rating: 4.9, totalReviews: 205 },
  { name: 'Meena Iyer', specialization: 'Pediatrician', experience: 12, qualification: 'MBBS, MD (Pediatrics)', bio: 'Dedicated to child health, growth and immunization programs.', email: 'meena@yshospitals.com', phone: '9876543213', consultationFee: 500, rating: 4.6, totalReviews: 178 },
  { name: 'Santhosh Pillai', specialization: 'Neurologist', experience: 20, qualification: 'MBBS, DM (Neurology)', bio: 'Specializes in epilepsy, stroke management, and movement disorders.', email: 'santhosh@yshospitals.com', phone: '9876543214', consultationFee: 1000, rating: 4.9, totalReviews: 167 },
  { name: 'Deepa Ramesh', specialization: 'Gynecologist', experience: 14, qualification: 'MBBS, MS (Obstetrics & Gynecology)', bio: 'Expert in maternal care, PCOS and laparoscopic procedures.', email: 'deepa@yshospitals.com', phone: '9876543215', consultationFee: 700, rating: 4.7, totalReviews: 231 },
  { name: 'Venkat Subramanian', specialization: 'Gastroenterologist', experience: 11, qualification: 'MBBS, DM (Gastroenterology)', bio: 'Specialist in digestive disorders, endoscopy and liver disease.', email: 'venkat@yshospitals.com', phone: '9876543216', consultationFee: 750, rating: 4.5, totalReviews: 89 },
  { name: 'Anitha Balaji', specialization: 'Ophthalmologist', experience: 9, qualification: 'MBBS, MS (Ophthalmology)', bio: 'Expert in cataract surgery, LASIK and retinal disorders.', email: 'anitha@yshospitals.com', phone: '9876543217', consultationFee: 550, rating: 4.6, totalReviews: 113 }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Doctor.deleteMany();
    await User.deleteMany({ role: 'admin' });

    const doctorsWithSlots = sampleDoctors.map(d => ({ ...d, availableSlots }));
    await Doctor.insertMany(doctorsWithSlots);

    await User.create({
      name: 'Y Hospital Admin',
      email: 'admin@yshospitals.com',
      password: 'Admin@1234',
      role: 'admin',
      phone: '9000000000'
    });

    console.log('✅ Database seeded successfully!');
    console.log('Admin: admin@yshospitals.com | Password: Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedDB();
