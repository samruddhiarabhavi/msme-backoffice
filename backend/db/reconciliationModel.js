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

async function getDueInvoices(businessId) {
  const [rows] = await pool.query(
    `SELECT invoice_number, amount, gst_amount, due_date, status
     FROM invoices
     WHERE business_id = ? 
     AND status IN ('pending', 'overdue')
     AND due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
    [businessId]
  );
  return rows;
}

async function detectAnomalies(businessId) {
  // Duplicate reference IDs
  const [duplicates] = await pool.query(
    `SELECT reference_id, COUNT(*) as count, SUM(amount) as total_amount
     FROM payments
     WHERE business_id = ? AND reference_id IS NOT NULL AND reference_id != ''
     GROUP BY reference_id
     HAVING COUNT(*) > 1`,
    [businessId]
  );

  // Unusually large transactions (2x se zyada average se)
  const [avgResult] = await pool.query(
    `SELECT AVG(amount) as avg_amount FROM payments WHERE business_id = ?`,
    [businessId]
  );
  const avgAmount = avgResult[0].avg_amount || 0;

  const [largeTxns] = await pool.query(
    `SELECT id, amount, mode, reference_id, payment_date
     FROM payments
     WHERE business_id = ? AND amount > ?`,
    [businessId, avgAmount * 2]
  );

  return { duplicates, largeTxns, avgAmount };
}

module.exports = { getPaymentsSummary, detectMismatches, getDueInvoices, detectAnomalies };
