const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendAppointmentConfirmation = async ({ to, patientName, doctorName, specialization, date, timeSlot, appointmentId }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Y's Hospitals" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `✅ Appointment Confirmed – Y's Hospitals`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #1a56db, #0e3a8c); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Y's Hospitals</h1>
          <p style="color: #93c5fd; margin: 5px 0 0;">Appointment Confirmation</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 15px;">
          <p style="color: #374151; font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
          <p style="color: #6b7280;">Your appointment has been successfully booked!</p>
          <div style="background: #eff6ff; border-left: 4px solid #1a56db; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0; color: #1e40af;"><strong>🩺 Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 8px 0; color: #1e40af;"><strong>🏥 Specialization:</strong> ${specialization}</p>
            <p style="margin: 8px 0; color: #1e40af;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #1e40af;"><strong>⏰ Time:</strong> ${timeSlot}</p>
            <p style="margin: 8px 0; color: #1e40af;"><strong>🔖 Appointment ID:</strong> ${appointmentId}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please arrive 10 minutes before your scheduled time. Bring your ID and any previous medical records.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">© ${new Date().getFullYear()} Y's Hospitals. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't throw — email failure shouldn't block booking
  }
};

exports.sendCancellationEmail = async ({ to, patientName, doctorName, date, timeSlot }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  await transporter.sendMail({
    from: `"Y's Hospitals" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `❌ Appointment Cancelled – Y's Hospitals`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${formattedDate}</strong> at <strong>${timeSlot}</strong> has been cancelled.</p>
        <p>If you need to rebook, please visit our portal.</p>
        <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Y's Hospitals</p>
      </div>
    `
  }).catch(console.error);
};
