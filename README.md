# AGENTS.md — MSME Back-office in a Box

## Project context
A Codex-powered back-office agent for small Indian businesses (kirana stores,
clinics, coaching centers). Stack: Node.js + Express backend, React frontend,
MySQL (Aiven-hosted) database, Google Gemini for the agentic reasoning layer.

Core agentic flows (each follows plan -> tool call -> review/format):
- UPI reconciliation: detect payment/invoice mismatches, generate a report, self-review it
- GST reminders: find due/overdue invoices, generate bilingual (English + Hindi) reminder messages
- Anomaly detection: flag duplicate reference IDs and unusually large transactions
- Natural-language query: convert a plain-English question into SQL, run it, explain the result

## Conventions
- Use async/await throughout, not .then() chains
- All SQL queries must be parameterized (never string-concatenate user input into SQL)
- Keep DB logic in db/ (models), business/AI logic in services/, HTTP logic in routes/
- Every agentic service exposes a single exported function (e.g. runReconciliation, runGstReminders)
- Currency is always ₹ (INR), never $

## Review guidelines
- Flag any route missing a try/catch around async DB or API calls
- Flag any Gemini-generated SQL query that isn't restricted to SELECT statements
- Flag any agentic flow that skips its review/self-check step
- Flag any hardcoded business_id, API key, or credential outside of .env

## Fast tools
- Prefer ripgrep (rg) over grep for searching this repo