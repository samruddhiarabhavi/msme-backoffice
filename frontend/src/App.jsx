import axios from 'axios';
import { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import NLQuery from './NLQuery';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage('Pehle ek CSV file select karo');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        'https://msme-backoffice.onrender.com/api/payments/upload-csv',
        formData
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="ledger-header">
        <h1>MSME Back-office</h1>
        <span className="tagline">in a box</span>
      </div>

      <div className="container">
        <div className="receipt-slip">
          <h2>Upload Payments</h2>
          <div className="file-input-row">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="btn-stamp" onClick={handleUpload}>Upload</button>
          </div>
          {message && <p className="upload-message">{message}</p>}
        </div>

        <Dashboard />
        <NLQuery />
      </div>
    </div>
  );
}

export default App;