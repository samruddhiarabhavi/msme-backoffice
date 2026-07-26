require('dotenv').config();
const { detectMismatches, getPaymentsSummary } = require('../db/reconciliationModel');

async function callCodexAPI(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.candidates[0].content.parts[0].text;
}

async function runReconciliation(businessId) {
  const mismatches = await detectMismatches(businessId);
  const summary = await getPaymentsSummary(businessId);

  const reportPrompt = `Given this reconciliation data:
Mismatches: ${JSON.stringify(mismatches)}
Payment Summary: ${JSON.stringify(summary)}
Generate a clear, human-readable reconciliation report for a small Indian business owner. Use ₹ (INR) instead of $. Keep it concise.`;
  const report = await callCodexAPI(reportPrompt);

  const reviewPrompt = `Review this reconciliation report for accuracy against the raw data.
Raw data: ${JSON.stringify({ mismatches, summary })}
Report: ${report}
Point out any errors or omissions. If correct, confirm accuracy in 1-2 sentences.`;
  const review = await callCodexAPI(reviewPrompt);

  return { rawData: { mismatches, summary }, report, review };
}

module.exports = { runReconciliation };