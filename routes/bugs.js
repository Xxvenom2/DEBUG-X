const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const Bug = require('../models/Bug');
const User = require('../models/User');

// ── MULTER SETUP ──
const fs = require('fs');
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|zip|txt|js|html|css/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('File type not allowed.'));
  }
});

// ── NODEMAILER TRANSPORTER ──
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ── MIDDLEWARE: require login ──
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Not authenticated.' });
  next();
}

// ── MIDDLEWARE: require admin ──
function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Not authenticated.' });
  if (req.session.role !== 'admin') return res.status(403).json({ message: 'Admin access only.' });
  next();
}

// ── POST /api/bugs — Submit a bug ──
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: 'Title and description are required.' });

    const user = await User.findById(req.session.userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const bug = await Bug.create({
      title,
      description,
      category: category || 'other',
      file: req.file ? req.file.filename : null,
      submittedBy: user.email,
      userId: user._id
    });

    // ── Send email notification to owner ──
    const fileInfo = req.file ? `\nAttached file: ${req.file.originalname}` : '\nNo file attached.';

    const mailOptions = {
      from: `"DebugX Notifications" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `🐛 New Bug Report: ${title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07090f;color:#e2e8f0;padding:32px;border-radius:12px;border:1px solid rgba(59,130,246,0.2)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:36px;height:36px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:white">DX</div>
            <span style="font-size:20px;font-weight:700;color:white">Debug<span style="color:#60a5fa">X</span></span>
          </div>
          <h2 style="color:white;margin-bottom:8px">New Bug Submitted</h2>
          <p style="color:#64748b;margin-bottom:24px;font-size:14px">A new bug report has been submitted on DebugX.</p>
          <div style="background:#0f1520;border:1px solid rgba(59,130,246,0.15);border-radius:12px;padding:24px;margin-bottom:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px">Title</td><td style="padding:8px 0;color:white;font-weight:600">${title}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Category</td><td style="padding:8px 0;color:#60a5fa">${category || 'other'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Submitted By</td><td style="padding:8px 0;color:white">${user.name} (${user.email})</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top">Description</td><td style="padding:8px 0;color:#e2e8f0;line-height:1.6">${description}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">File</td><td style="padding:8px 0;color:white">${req.file ? req.file.originalname : 'None'}</td></tr>
            </table>
          </div>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin.html" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View in Admin Panel →</a>
          <p style="color:#64748b;font-size:12px;margin-top:24px">DebugX — Bug tracking made simple.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email error:', err.message);
      else console.log('Email sent:', info.messageId);
    });

    res.status(201).json({ message: 'Bug submitted successfully.', bug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/bugs/mine — Get current user's bugs ──
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bugs = await Bug.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/bugs/all — Admin: get all bugs ──
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── PATCH /api/bugs/:id/status — Admin: update status ──
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await Bug.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!bug) return res.status(404).json({ message: 'Bug not found.' });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/bugs/:id — Admin: delete a bug ──
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
