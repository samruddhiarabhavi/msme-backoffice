// frontend/src/App.jsx
import axios from 'axios';
import { useState } from 'react';
import './App.css';

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
        'http://localhost:5000/api/payments/upload-csv',
        formData
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="App" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>MSME Back-office — Payment Upload</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        Upload
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;