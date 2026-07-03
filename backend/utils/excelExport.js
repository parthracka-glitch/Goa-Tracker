const ExcelJS = require('exceljs');

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

const COLUMNS = [
  { header: 'Name', key: 'name', width: 22 },
  { header: 'Phone', key: 'phone', width: 16 },
  { header: 'Email', key: 'email', width: 26 },
  { header: 'Client Origin', key: 'location', width: 22 },
  { header: 'Car Interest', key: 'carInterested', width: 22 },
  { header: 'Message', key: 'message', width: 30 },
  { header: 'Submitted At', key: 'submittedAt', width: 20 },
];

function addSheet(workbook, sheetName, enquiries) {
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5C158' }, // warm gold header, matches your brand palette
  };

  enquiries.forEach((e) => {
    sheet.addRow({
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      location: e.location || '',
      carInterested: e.carInterested || '',
      message: e.message || '',
      submittedAt: new Date(e.createdAt).toLocaleString('en-IN'),
    });
  });
}

async function generateDayExcel(res, dateKey, enquiries) {
  const workbook = new ExcelJS.Workbook();
  const formattedDate = formatDateDisplay(dateKey);
  addSheet(workbook, formattedDate, enquiries);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${formattedDate}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

async function generateMonthExcel(res, month, enquiries) {
  const workbook = new ExcelJS.Workbook();
  const [year, monthNum] = month.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sheet = workbook.addWorksheet(monthLabel);
  
  const columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Client Origin', key: 'location', width: 22 },
    { header: 'Car Interest', key: 'carInterested', width: 22 },
    { header: 'Message', key: 'message', width: 30 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
  ];

  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5C158' },
  };

  enquiries.forEach((e) => {
    sheet.addRow({
      date: formatDateDisplay(e.dateKey),
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      location: e.location || '',
      carInterested: e.carInterested || '',
      message: e.message || '',
      submittedAt: new Date(e.createdAt).toLocaleString('en-IN'),
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="enquiries-${month}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateDayExcel, generateMonthExcel };
