
const pool = require('./connection');

async function getPaymentsSummary(businessId) {
  const [rows] = await pool.query(
    `SELECT mode, COUNT(*) as count, SUM(amount) as total 
     FROM payments 
     WHERE business_id = ? 
     GROUP BY mode`,
    [businessId]
  );
  return rows;
}

async function detectMismatches(businessId) {
  const [rows] = await pool.query(
    `SELECT i.invoice_number, i.amount as invoice_amount, 
            p.amount as payment_amount, p.reference_id
     FROM invoices i
     LEFT JOIN payments p ON i.id = p.invoice_id
     WHERE i.business_id = ? 
     AND (p.amount IS NULL OR i.amount != p.amount)`,
    [businessId]
  );
  return rows;
}

module.exports = { getPaymentsSummary, detectMismatches };