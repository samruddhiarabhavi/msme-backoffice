const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { insertPayment } = require('../db/paymentsModel'); // yahan add karo

const upload = multer({ dest: 'uploads/' });

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