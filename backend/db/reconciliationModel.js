
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

module.exports = { getPaymentsSummary, detectMismatches, getDueInvoices };
