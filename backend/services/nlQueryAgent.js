require('dotenv').config();
const pool = require('../db/connection');

async function callGeminiAPI(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function runNLQuery(businessId, userQuestion) {
  // Step 1 (Plan): Gemini se SQL query banwao
  const schemaContext = `
Tables:
- invoices(id, business_id, invoice_number, amount, gst_amount, due_date, status)
- payments(id, business_id, invoice_id, amount, mode, reference_id, payment_date)
`;
  const sqlPrompt = `${schemaContext}
User question: "${userQuestion}"
Business ID to filter by: ${businessId}
Write ONLY a valid MySQL SELECT query (no explanation, no markdown formatting) that answers this question. Always include "WHERE business_id = ${businessId}" (or table alias equivalent).`;

  let sqlQuery = await callGeminiAPI(sqlPrompt);
  sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim(); // markdown fences hata do agar aayein

  // Safety check: sirf SELECT allow karo
  if (!sqlQuery.toLowerCase().startsWith('select')) {
    throw new Error('Only SELECT queries are allowed for safety');
  }

  // Step 2 (Tool call): query execute karo
  const [rows] = await pool.query(sqlQuery);

  // Step 3 (Review/format): result ko readable banwao
  const formatPrompt = `User asked: "${userQuestion}"
Raw query result: ${JSON.stringify(rows)}
Summarize this result in a clear, friendly sentence or short list for a small business owner. Use ₹ for amounts.`;
  const answer = await callGeminiAPI(formatPrompt);

  return { sqlQuery, rawResult: rows, answer };
}

module.exports = { runNLQuery };