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
  <div className="notes-strip">
    <h3>Ask your back-office</h3>
    <input
      type="text"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="e.g. How much cash did I collect?"
      onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
    />
    <button onClick={handleAsk}>{loading ? 'Thinking...' : 'Ask'}</button>
    {answer && <p className="answer">{answer}</p>}
  </div>
);
}

export default NLQuery;