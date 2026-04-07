const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor, getSpecializations
} = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctor);

router.post('/', protect, adminOnly, [
  body('name').notEmpty().withMessage('Name is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('qualification').notEmpty().withMessage('Qualification is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('consultationFee').isNumeric().withMessage('Fee must be a number')
], addDoctor);

router.put('/:id', protect, adminOnly, updateDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);

module.exports = router;
