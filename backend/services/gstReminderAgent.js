require('dotenv').config();
const { getDueInvoices } = require('../db/reconciliationModel');

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

async function runGstReminders(businessId) {
  const dueInvoices = await getDueInvoices(businessId);

  if (dueInvoices.length === 0) {
    return { dueInvoices: [], reminders: 'No invoices due in the next 7 days.' };
  }

  const planPrompt = `Given these due/overdue invoices for a small Indian business:
${JSON.stringify(dueInvoices)}
Generate a friendly but firm GST/payment reminder message for each invoice, suitable for sending via SMS or WhatsApp. Keep each message under 3 lines. Use ₹ for amounts.

For each invoice, provide the message in BOTH English and Hindi (Devanagari script), clearly labeled like this:

**Invoice #XXX**
English: <message>
Hindi: <message>
`;
  const reminders = await callGeminiAPI(planPrompt);

  return { dueInvoices, reminders };
}

module.exports = { runGstReminders };