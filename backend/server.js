// server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');

const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection on startup
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connected successfully:', rows[0].result); // should print 2
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
  }
}
testConnection();

app.listen(5000, () => console.log('Server running on port 5000'));