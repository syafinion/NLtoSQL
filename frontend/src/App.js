import React, { useState } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function App() {
  const [question, setQuestion] = useState("");
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSql("");
    try {
      const res = await fetch(`${BACKEND_URL}/generate_sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSql(data.sql);
    } catch (err) {
      setError("Failed to generate SQL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Natural Language to SQL</h1>
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your data..."
            style={{ width: 350, padding: 8, fontSize: 16 }}
            required
          />
          <button type="submit" style={{ marginLeft: 10, padding: '8px 16px', fontSize: 16 }} disabled={loading}>
            {loading ? "Generating..." : "Generate SQL"}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        {sql && (
          <div style={{ textAlign: 'left', background: '#222', padding: 20, borderRadius: 8, maxWidth: 600, margin: '0 auto' }}>
            <h2>Generated SQL:</h2>
            <pre style={{ color: '#61dafb', fontSize: 16 }}>{sql}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
