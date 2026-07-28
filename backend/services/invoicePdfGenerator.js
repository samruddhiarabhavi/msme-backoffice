const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoice, res) {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoice_number}.pdf`);
  doc.pipe(res);

  
   const dueDate = new Date(invoice.due_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  doc.fontSize(20).text('MSME Back-office', { align: 'center' });
  doc.fontSize(10).text('Invoice', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).text(`Invoice Number: ${invoice.invoice_number}`);
  doc.text(`Amount: Rs. ${invoice.amount}`);
  doc.text(`GST: Rs. ${invoice.gst_amount}`);
  doc.text(`Due Date: ${invoice.due_date}`);
  doc.text(`Status: ${invoice.status}`);

  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for your business.', { align: 'center' });

  doc.end();
}

module.exports = { generateInvoicePDF };