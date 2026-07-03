const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitEnquiry(data) {
  const res = await fetch(`${API_BASE}/api/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Submission failed');
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  return res.json();
}

export async function fetchDates() {
  const res = await fetch(`${API_BASE}/api/enquiry/dates`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load dates');
  return res.json();
}

export async function fetchEnquiriesForDate(date) {
  const res = await fetch(`${API_BASE}/api/enquiry?date=${date}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load enquiries');
  return res.json();
}

export function downloadUrl(path, params) {
  const query = new URLSearchParams(params).toString();
  return `${API_BASE}${path}?${query}`;
}

export async function downloadFile(path, params, filename) {
  const url = downloadUrl(path, params);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export { API_BASE, authHeaders };
