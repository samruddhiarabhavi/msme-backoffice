import axios from 'axios';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/payments/dashboard')
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

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px',
    minWidth: '200px',
    textAlign: 'center'
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', padding: '20px' }}>
      <div style={cardStyle}>
        <h3>Total Sales</h3>
        <p style={{ fontSize: '24px' }}>₹{data.totalSales.toFixed(2)}</p>
      </div>
      <div style={cardStyle}>
        <h3>Pending Mismatches</h3>
        <p style={{ fontSize: '24px' }}>{data.pendingMismatches}</p>
      </div>
      <div style={cardStyle}>
        <h3>GST Due (7 days)</h3>
        <p style={{ fontSize: '24px' }}>{data.gstDueCount}</p>
      </div>
    </div>
  );
}

export default Dashboard;