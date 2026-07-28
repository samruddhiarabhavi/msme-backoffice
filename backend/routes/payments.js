const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { insertPayment } = require('../db/paymentsModel'); // yahan add karo

const upload = multer({ dest: 'uploads/' });
const { detectMismatches, getPaymentsSummary, getDueInvoices } = require('../db/reconciliationModel');
const { runReconciliation } = require('../services/reconciliationAgent');
const { runNLQuery } = require('../services/nlQueryAgent');
const { generateInvoicePDF } = require('../services/invoicePdfGenerator');
const pool = require('../db/connection');
const { runAnomalyCheck } = require('../services/anomalyAgent');

router.get('/check-anomalies', async (req, res) => {
  try {
    const result = await runAnomalyCheck(1);
    res.json(result);
  } catch (err) {
    console.error('Anomaly check error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/invoice/:invoiceNumber/pdf', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM invoices WHERE invoice_number = ?',
      [req.params.invoiceNumber]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    generateInvoicePDF(rows[0], res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/nl-query', express.json(), async (req, res) => {
  try {
    const { question } = req.body;
    const result = await runNLQuery(1, question);
    res.json(result);
  } catch (err) {
    console.error('NL query error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/dashboard', async (req, res) => {
  try {
    const businessId = 1;
    const summary = await getPaymentsSummary(businessId);
    const mismatches = await detectMismatches(businessId);
    const dueInvoices = await getDueInvoices(businessId);

    const totalSales = summary.reduce((sum, s) => sum + parseFloat(s.total), 0);

    res.json({
      totalSales,
      paymentModes: summary,
      pendingMismatches: mismatches.length,
      mismatchDetails: mismatches,
      gstDueCount: dueInvoices.length,
      gstDueDetails: dueInvoices
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/run-agent-reconcile', async (req, res) => {
  try {
    const result = await runReconciliation(1);
    res.json(result);
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: err.message });
  }
});
const { runGstReminders } = require('../services/gstReminderAgent');

router.get('/run-gst-reminders', async (req, res) => {
  try {
    const result = await runGstReminders(1);
    res.json(result);
  } catch (err) {
    console.error('GST reminder error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/test-reconcile', async (req, res) => {
  const mismatches = await detectMismatches(1); // businessId = 1
  const summary = await getPaymentsSummary(1);
  res.json({ mismatches, summary });
});

router.post('/upload-csv', upload.single('file'), async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      try {
        const businessId = 1;
        for (const row of results) {
          await insertPayment(businessId, row);
        }
        res.json({ message: `${results.length} payments inserted successfully` });
      }  catch (err) {
  console.error('Upload error:', err); // yeh add karo
  res.status(500).json({ error: err.message });
}
    });
});

module.exports = router;