const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    carInterested: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    // dateKey groups enquiries by day, e.g. "2026-07-02" — used for all day-wise queries/exports
    dateKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
