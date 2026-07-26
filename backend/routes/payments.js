const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { insertPayment } = require('../db/paymentsModel'); // yahan add karo

const upload = multer({ dest: 'uploads/' });
const { detectMismatches, getPaymentsSummary } = require('../db/reconciliationModel');

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