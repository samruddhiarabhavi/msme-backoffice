const pool = require('./connection');

async function insertPayment(businessId, payment) {
  const { amount, mode, reference_id, payment_date } = payment;
  const [result] = await pool.query(
    `INSERT INTO payments (business_id, amount, mode, reference_id, payment_date) 
     VALUES (?, ?, ?, ?, ?)`,
    [businessId, amount, mode, reference_id, payment_date]
  );
  return result.insertId;
}

module.exports = { insertPayment };