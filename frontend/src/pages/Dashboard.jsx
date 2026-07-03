import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDates, fetchEnquiriesForDate, downloadFile } from '../api.js';

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

export default function Dashboard() {
  const [dates, setDates] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDates();
  }, []);

  async function loadDates() {
    setLoading(true);
    try {
      const data = await fetchDates();
      setDates(data);
      if (data.length) {
        const newestMonth = data[0].date.slice(0, 7);
        setSelectedMonth(newestMonth);
        const filtered = data.filter(d => d.date.startsWith(newestMonth));
        const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
        if (sorted.length) {
          selectDate(sorted[0].date);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }

  async function selectDate(date) {
    setSelectedDate(date);
    setLoading(true);
    try {
      const data = await fetchEnquiriesForDate(date);
      setEnquiries(data);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(newMonth) {
    setSelectedMonth(newMonth);
    const filtered = dates.filter(d => d.date.startsWith(newMonth));
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length) {
      selectDate(sorted[0].date);
    } else {
      setEnquiries([]);
      setSelectedDate(null);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    navigate('/admin/login');
  }

  const uniqueMonths = Array.from(
    new Set(dates.map((d) => d.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));
  const monthsList = uniqueMonths.length > 0 ? uniqueMonths : [new Date().toISOString().slice(0, 7)];

  const filteredDates = dates.filter((d) => d.date.startsWith(selectedMonth));
  const sortedFilteredDates = [...filteredDates].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-gold">Enquiry Admin</h2>
        </div>

        {/* Month Selection */}
        <div className="p-4 border-b border-white/10">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Select Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
          >
            {monthsList.map((m) => {
              const [year, month] = m.split('-');
              const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
              const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <option key={m} value={m} className="bg-ink text-white">
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sortedFilteredDates.length === 0 && (
            <p className="text-xs text-gray-400 px-2 py-4">No enquiries for this month.</p>
          )}
          {sortedFilteredDates.map((d) => (
            <button
              key={d.date}
              onClick={() => selectDate(d.date)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition ${
                selectedDate === d.date ? 'bg-gold text-ink font-semibold' : 'hover:bg-white/10'
              }`}
            >
              <span>{formatDateDisplay(d.date)}</span>
              <span className="text-xs opacity-70">{d.count}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-sm text-gray-300 hover:text-white py-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink">
              {selectedDate ? `Enquiries — ${formatDateDisplay(selectedDate)}` : 'Select a date'}
            </h1>
            <p className="text-sm text-gray-500">{enquiries.length} total</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {selectedDate && (
              <>
                <button
                  onClick={() =>
                    downloadFile(
                      '/api/export/pdf/day',
                      { date: selectedDate },
                      `enquiries-${formatDateDisplay(selectedDate)}.pdf`
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-gray-800"
                >
                  Download Day PDF
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      '/api/export/excel/day',
                      { date: selectedDate },
                      `enquiries-${formatDateDisplay(selectedDate)}.xlsx`
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-gold text-ink text-sm font-medium hover:opacity-90"
                >
                  Download Day Excel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Month-wise export panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-sm font-medium text-gray-700">Export whole month: </span>
            <span className="text-sm font-bold text-ink uppercase">
              {(() => {
                const [year, month] = selectedMonth.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
                return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              })()}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                downloadFile('/api/export/pdf/month', { month: selectedMonth }, `enquiries-${selectedMonth}.pdf`)
              }
              className="px-3 py-1.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-gray-800"
            >
              Month PDF
            </button>
            <button
              onClick={() =>
                downloadFile(
                  '/api/export/excel/month',
                  { month: selectedMonth },
                  `enquiries-${selectedMonth}.xlsx`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-gold text-ink text-sm font-medium hover:opacity-90"
            >
              Month Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Client Origin</th>
                <th className="text-left px-4 py-3 font-medium">Car Interest</th>
                <th className="text-left px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && enquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No enquiries for this date.
                  </td>
                </tr>
              )}
              {!loading &&
                enquiries.map((e) => (
                  <tr key={e._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{e.name}</td>
                    <td className="px-4 py-3">{e.phone}</td>
                    <td className="px-4 py-3">{e.email || '-'}</td>
                    <td className="px-4 py-3">{e.location || '-'}</td>
                    <td className="px-4 py-3">{e.carInterested || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(e.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
