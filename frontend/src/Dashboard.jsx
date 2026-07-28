import axios from 'axios';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://msme-backoffice.onrender.com/api/payments/dashboard')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Failed to load dashboard.</p>;



 return (
  <div className="ledger-cards">
    <div className="ledger-card sales">
      <div className="stamp-badge">CASH</div>
      <div className="label">Total Sales</div>
      <div className="value">₹{data.totalSales.toFixed(2)}</div>
    </div>
    <div className="ledger-card mismatch">
      <div className="stamp-badge">CHECK</div>
      <div className="label">Pending Mismatches</div>
      <div className="value">{data.pendingMismatches}</div>
    </div>
    <div className="ledger-card gst">
      <div className="stamp-badge">DUE</div>
      <div className="label">GST Due (7 days)</div>
      <div className="value">{data.gstDueCount}</div>
    </div>
  </div>
);
}

export default Dashboard;