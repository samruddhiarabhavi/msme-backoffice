import axios from 'axios';
import { useState } from 'react';

function NLQuery() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await axios.post('https://msme-backoffice.onrender.com/api/payments/nl-query', {
        question
      });
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', margin: '10px' }}>
      <h3>Ask your back-office</h3>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. How much cash did I collect?"
        style={{ width: '300px', padding: '8px' }}
        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
      />
      <button onClick={handleAsk} style={{ marginLeft: '10px', padding: '8px 16px' }}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {answer && <p style={{ marginTop: '15px' }}>{answer}</p>}
    </div>
  );
}

export default NLQuery;