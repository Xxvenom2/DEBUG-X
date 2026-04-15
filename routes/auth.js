const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });

    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({ message: 'Account created.', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password.' });

    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({ message: 'Login successful.', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: 'Not authenticated.' });

  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
