import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("scam");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, type: activeTab }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Could not connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">ScamRadar</div>
        <span className="live-badge">Live</span>
      </nav>

      <div className="hero-bar">
        <h1>Is this a scam?</h1>
        <p>Paste any message or link and our AI will analyze it instantly.</p>
      </div>

      <div className="main">
        <div className="tabs">
          <button className={activeTab === "scam" ? "tab active" : "tab"} onClick={() => { setActiveTab("scam"); setResult(null); setInput(""); setError(null); }}>Scam Checker</button>
          <button className={activeTab === "phishing" ? "tab active" : "tab"} onClick={() => { setActiveTab("phishing"); setResult(null); setInput(""); setError(null); }}>Phishing Detector</button>
          <button className={activeTab === "password" ? "tab active" : "tab"} onClick={() => { setActiveTab("password"); setResult(null); setInput(""); setError(null); }}>Password Health</button>
        </div>

        <div className="scan-box">
          <textarea
            className="scan-input"
            rows={5}
            placeholder={activeTab === "scam" ? "Paste a suspicious SMS, WhatsApp or email here..." : activeTab === "phishing" ? "Paste a suspicious link here..." : "Type a password to check its strength..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="scan-btn" onClick={handleScan} disabled={loading}>
            {loading ? "Analyzing with AI..." : "Scan Now"}
          </button>
        </div>

        {error && (
          <div className="result-card danger">
            <div className="result-icon">❌</div>
            <div>
              <div className="result-message">Error</div>
              <div className="result-tip">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <div className={"result-card " + result.status}>
            <div className="result-icon">
              {result.status === "danger" ? "🚨" : result.status === "warning" ? "⚠️" : "✅"}
            </div>
            <div>
              <div className="result-message">{result.message}</div>
              <div className="result-tip">{result.tip}</div>
              {result.confidence && <div className="result-tip">Confidence: {result.confidence}</div>}
            </div>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-card"><h3>10M+</h3><p>Scams sent daily</p></div>
          <div className="stat-card"><h3>1 in 3</h3><p>Fall for phishing</p></div>
          <div className="stat-card"><h3>Free</h3><p>Always free</p></div>
          <div className="stat-card"><h3>AI</h3><p>Powered by Claude</p></div>
        </div>

        <div className="alerts-section">
          <h2>Live Threat Alerts</h2>
          <div className="alert-item danger"><span className="dot"></span><div><div className="alert-title">Fake bank SMS circulating — targets mobile banking users</div><div className="alert-time">2 hours ago · High severity</div></div></div>
          <div className="alert-item warning"><span className="dot"></span><div><div className="alert-title">Phishing site mimicking PayPal login detected</div><div className="alert-time">5 hours ago · Medium severity</div></div></div>
          <div className="alert-item warning"><span className="dot"></span><div><div className="alert-title">WhatsApp job offer scam targeting students</div><div className="alert-time">Yesterday · Medium severity</div></div></div>
        </div>
      </div>

      <footer className="footer">
        <p>ScamRadar — Protecting people online, globally. Free forever.</p>
      </footer>
    </div>
  );
}

export default App;