const express = require('express');
const Enquiry = require('../models/Enquiry');
const requireAuth = require('../middleware/auth');
const { generateDayPdf, generateMonthPdf } = require('../utils/pdfExport');
const { generateDayExcel, generateMonthExcel } = require('../utils/excelExport');

const router = express.Router();

// GET /api/export/pdf/day?date=YYYY-MM-DD
router.get('/pdf/day', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required' });
    const enquiries = await Enquiry.find({ dateKey: date }).sort({ createdAt: 1 });
    generateDayPdf(res, date, enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/export/excel/day?date=YYYY-MM-DD
router.get('/excel/day', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required' });
    const enquiries = await Enquiry.find({ dateKey: date }).sort({ createdAt: 1 });
    await generateDayExcel(res, date, enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/export/pdf/month?month=YYYY-MM
router.get('/pdf/month', requireAuth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required' });
    const enquiries = await Enquiry.find({ dateKey: { $regex: `^${month}` } }).sort({
      dateKey: 1,
      createdAt: 1,
    });
    generateMonthPdf(res, month, enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/export/excel/month?month=YYYY-MM
router.get('/excel/month', requireAuth, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required' });
    const enquiries = await Enquiry.find({ dateKey: { $regex: `^${month}` } }).sort({
      dateKey: 1,
      createdAt: 1,
    });
    await generateMonthExcel(res, month, enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
