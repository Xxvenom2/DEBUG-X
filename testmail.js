require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'DebugX Test Email',
  text: 'If you see this, email is working!'
}, (err, info) => {
  if (err) console.log('ERROR:', err.message);
  else console.log('SUCCESS:', info.messageId);
});