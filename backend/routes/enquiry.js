const express = require('express');
const Enquiry = require('../models/Enquiry');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function todayKey() {
  // YYYY-MM-DD in local server time
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

// PUBLIC — anyone can submit an enquiry (no login required)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, location, carInterested, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      location,
      carInterested,
      message,
      dateKey: todayKey(),
    });

    res.status(201).json({ message: 'Enquiry submitted', enquiry });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PROTECTED — list of distinct dates with enquiry counts (for the admin dashboard sidebar)
router.get('/dates', requireAuth, async (req, res) => {
  try {
    const results = await Enquiry.aggregate([
      { $group: { _id: '$dateKey', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    res.json(results.map((r) => ({ date: r._id, count: r.count })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PROTECTED — get enquiries for a specific date (or all, if no date given)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { dateKey: date } : {};
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
