import React, { useState } from 'react';
import { submitEnquiry } from '../api.js';

const initial = { name: '', phone: '', email: '', location: '', carInterested: '', message: '' };

export default function EnquiryForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await submitEnquiry(form);
      setStatus({ loading: false, success: true, error: '' });
      setForm(initial);
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Car Rental Enquiry</h1>
        <p className="text-sm text-gray-500 mb-6">
          Tell us what you're looking for and we'll get back to you shortly.
        </p>

        {status.success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
            Thanks! Your enquiry has been received.
          </div>
        )}
        {status.error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Where are you from? (City / State)</label>
            <input
              name="location"
              placeholder="e.g. Delhi, Mumbai, London"
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car of Interest</label>
            <input
              name="carInterested"
              value={form.carInterested}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60"
          >
            {status.loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
