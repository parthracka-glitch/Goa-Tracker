const PDFDocument = require('pdfkit');

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

// Renders a simple table for one day's enquiries onto an existing PDFDocument
function renderDayTable(doc, dateKey, enquiries) {
  doc.fontSize(16).text(`Enquiries — ${formatDateDisplay(dateKey)}`, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555').text(`Total enquiries: ${enquiries.length}`);
  doc.moveDown(0.8);

  const colX = { name: 40, phone: 150, email: 250, location: 380, car: 480 };
  const rowHeight = 20;

  function drawHeader(y) {
    doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
    doc.text('Name', colX.name, y);
    doc.text('Phone', colX.phone, y);
    doc.text('Email', colX.email, y);
    doc.text('Client Origin', colX.location, y);
    doc.text('Car Interest', colX.car, y);
    doc.font('Helvetica');
  }

  let y = doc.y;
  drawHeader(y);
  y += rowHeight;

  enquiries.forEach((e) => {
    if (y > 510) {
      doc.addPage();
      y = 40;
      drawHeader(y);
      y += rowHeight;
    }
    doc.fontSize(8).fillColor('#222');
    doc.text(e.name || '-', colX.name, y, { width: 100 });
    doc.text(e.phone || '-', colX.phone, y, { width: 90 });
    doc.text(e.email || '-', colX.email, y, { width: 120 });
    doc.text(e.location || '-', colX.location, y, { width: 90 });
    doc.text(e.carInterested || '-', colX.car, y, { width: 90 });
    y += rowHeight;
  });

  doc.y = y;
}

// Single-day PDF, streamed directly to the HTTP response
function generateDayPdf(res, dateKey, enquiries) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${formatDateDisplay(dateKey)}.pdf"`);
  doc.pipe(res);
  renderDayTable(doc, dateKey, enquiries);
  doc.end();
}

// Multi-day PDF (consolidated list), for a whole-month export
function generateMonthPdf(res, month, enquiries) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${month}.pdf"`);
  doc.pipe(res);

  const [year, monthNum] = month.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  doc.fontSize(16).text(`Enquiries — ${monthLabel}`, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555').text(`Total enquiries: ${enquiries.length}`);
  doc.moveDown(0.8);

  const colX = { date: 40, name: 110, phone: 220, email: 320, location: 450, car: 550 };
  const rowHeight = 20;

  function drawHeader(y) {
    doc.fontSize(9).fillColor('#000').font('Helvetica-Bold');
    doc.text('Date', colX.date, y);
    doc.text('Name', colX.name, y);
    doc.text('Phone', colX.phone, y);
    doc.text('Email', colX.email, y);
    doc.text('Client Origin', colX.location, y);
    doc.text('Car Interest', colX.car, y);
    doc.font('Helvetica');
  }

  let y = doc.y;
  drawHeader(y);
  y += rowHeight;

  enquiries.forEach((e) => {
    if (y > 510) {
      doc.addPage();
      y = 40;
      drawHeader(y);
      y += rowHeight;
    }
    doc.fontSize(8).fillColor('#222');
    doc.text(formatDateDisplay(e.dateKey) || '-', colX.date, y, { width: 65 });
    doc.text(e.name || '-', colX.name, y, { width: 100 });
    doc.text(e.phone || '-', colX.phone, y, { width: 90 });
    doc.text(e.email || '-', colX.email, y, { width: 120 });
    doc.text(e.location || '-', colX.location, y, { width: 90 });
    doc.text(e.carInterested || '-', colX.car, y, { width: 90 });
    y += rowHeight;
  });

  doc.end();
}

module.exports = { generateDayPdf, generateMonthPdf };
