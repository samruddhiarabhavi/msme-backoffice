require('dotenv').config();
const { detectAnomalies } = require('../db/reconciliationModel');

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

async function runAnomalyCheck(businessId) {
  const { duplicates, largeTxns, avgAmount } = await detectAnomalies(businessId);

  if (duplicates.length === 0 && largeTxns.length === 0) {
    return { duplicates, largeTxns, alert: 'No anomalies detected. All transactions look normal.' };
  }

  const prompt = `You are a fraud-detection assistant for a small Indian business.
Average transaction amount: ₹${parseFloat(avgAmount).toFixed(2)}
Duplicate reference IDs found: ${JSON.stringify(duplicates)}
Unusually large transactions found: ${JSON.stringify(largeTxns)}

Write a short, clear alert (3-5 sentences) explaining what looks suspicious and what the business owner should check first. Use ₹ for amounts.`;

  const alert = await callGeminiAPI(prompt);
  return { duplicates, largeTxns, alert };
}

module.exports = { runAnomalyCheck };