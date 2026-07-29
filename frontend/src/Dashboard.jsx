import axios from 'axios';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anomalyAlert, setAnomalyAlert] = useState('');
  const [checkingAnomalies, setCheckingAnomalies] = useState(false);

  useEffect(() => {
    axios.get('https://msme-backoffice.onrender.com/api/payments/dashboard')
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const handleCheckAnomalies = async () => {
    setCheckingAnomalies(true);
    try {
      const res = await axios.get('https://msme-backoffice.onrender.com/api/payments/check-anomalies');
      setAnomalyAlert(res.data.alert);
    } catch (err) {
      setAnomalyAlert('Error checking anomalies: ' + err.message);
    }
    setCheckingAnomalies(false);
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!data) {
    return <p>Failed to load dashboard.</p>;
  }

  return (
    <div>
      <div className="ledger-cards">
        <div className="ledger-card sales">
          <div className="label">Total Sales</div>
          <div className="value">Rs. {data.totalSales.toFixed(2)}</div>
        </div>
        <div className="ledger-card mismatch">
          <div className="label">Pending Mismatches</div>
          <div className="value">{data.pendingMismatches}</div>
        </div>
        <div className="ledger-card gst">
          <div className="label">GST Due (7 days)</div>
          <div className="value">{data.gstDueCount}</div>
        </div>
      </div>

      <button className="btn-stamp" onClick={handleCheckAnomalies} style={{ marginTop: '16px' }}>
        {checkingAnomalies ? 'Checking...' : 'Check for Anomalies'}
      </button>

      {anomalyAlert ? <p className="upload-message">{anomalyAlert}</p> : null}

      {data.gstDueDetails && data.gstDueDetails.length > 0 ? (
        <div className="receipt-slip" style={{ marginTop: '16px' }}>
          <h2>Due Invoices</h2>
          {data.gstDueDetails.map(function (inv) {
            const pdfUrl = 'https://msme-backoffice.onrender.com/api/payments/invoice/' + inv.invoice_number + '/pdf';
            return (
              <div key={inv.invoice_number} style={{ marginBottom: '8px' }}>
                {inv.invoice_number} - Rs. {inv.amount}{' '}
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  Download PDF
                </a>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;