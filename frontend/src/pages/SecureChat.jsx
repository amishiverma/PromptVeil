import { useState, useRef, useEffect } from 'react';

// ─── Typing indicator dots ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="sc-msg sc-msg--ai">
      <div className="sc-avatar sc-avatar--ai">AI</div>
      <div className="sc-bubble sc-bubble--typing">
        <span className="sc-dot" />
        <span className="sc-dot" />
        <span className="sc-dot" />
      </div>
    </div>
  );
}

// ─── Individual message bubble ─────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  const isBlocked = msg.role === 'blocked';

  if (isBlocked) {
    return (
      <div className="sc-alert">
        <div className="sc-alert-header">
          <span className="sc-alert-icon">🛡</span>
          <span>PromptVeil Blocked This Request</span>
          <span className={`sc-badge sc-badge--${msg.level}`}>{msg.level?.toUpperCase()}</span>
        </div>
        <p className="sc-alert-body">{msg.description}</p>
        <div className="sc-alert-meta">
          <span>Risk Score: <b style={{color:'#f97316'}}>{msg.score}/100</b></span>
          {msg.threats?.length > 0 && (
            <span>Vectors: <b>{msg.threats.join(', ')}</b></span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`sc-msg ${isUser ? 'sc-msg--user' : 'sc-msg--ai'}`}>
      {!isUser && <div className="sc-avatar sc-avatar--ai">AI</div>}
      <div className={`sc-bubble ${isUser ? 'sc-bubble--user' : 'sc-bubble--ai'}`}>
        {msg.content}
        <div className="sc-timestamp">{msg.time}</div>
      </div>
      {isUser && <div className="sc-avatar sc-avatar--user">U</div>}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function SecureChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your PromptVeil-secured AI assistant. Every message you send is scanned by the dual-layer defense engine before reaching the AI. Ask me anything!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [scanStatus, setScanStatus] = useState({ text: 'Shields Active', color: '#22c55e' });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: text, time: now() }]);
    setInput('');
    setIsTyping(true);
    setScanStatus({ text: 'Scanning...', color: '#f59e0b' });

    try {
      // ── Layer 1: PromptVeil Security Check ──────────────────────────────
      const pvRes = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const pvData = await pvRes.json();

      if (!pvData.is_safe) {
        setScanStatus({ text: 'Threat Blocked', color: '#ef4444' });
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'blocked',
          level: pvData.threat_level,
          description: pvData.description,
          score: pvData.risk_score,
          threats: pvData.threats_found,
          time: now(),
        }]);
        setTimeout(() => setScanStatus({ text: 'Shields Active', color: '#22c55e' }), 3000);
        return;
      }

      setScanStatus({ text: 'Safe — Forwarding to AI', color: '#3b82f6' });

      // ── Layer 2: Gemini API Call (add your key below) ───────────────────
      // TODO: Replace with your actual Gemini API call
      // const geminiRes = await fetch(
      //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY`,
      //   { method: 'POST', headers: {'Content-Type':'application/json'},
      //     body: JSON.stringify({ contents: [{ parts: [{ text }] }] }) }
      // );
      // const geminiData = await geminiRes.json();
      // const aiReply = geminiData.candidates[0].content.parts[0].text;

      // Placeholder until Gemini key is added:
      const aiReply = `[Gemini API not yet connected] Your message "${text}" passed all PromptVeil security checks (Risk Score: ${pvData.risk_score}/100). Add your Gemini API key in SecureChat.jsx to get real AI responses!`;

      setIsTyping(false);
      setScanStatus({ text: 'Shields Active', color: '#22c55e' });
      setMessages(prev => [...prev, { role: 'ai', content: aiReply, time: now() }]);

    } catch (err) {
      setIsTyping(false);
      setScanStatus({ text: 'Backend Offline', color: '#ef4444' });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ Unable to connect to PromptVeil backend. Please make sure the Python server is running on port 8000.',
        time: now(),
      }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sc-page">
      {/* ── Header ── */}
      <div className="sc-header">
        <div className="sc-header-left">
          <div className="sc-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2 className="sc-header-title">Secure AI Chat</h2>
            <p className="sc-header-sub">Protected by PromptVeil dual-layer engine</p>
          </div>
        </div>
        <div className="sc-status-pill" style={{ borderColor: scanStatus.color, color: scanStatus.color }}>
          <span className="sc-status-dot" style={{ background: scanStatus.color }} />
          {scanStatus.text}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="sc-messages">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {isTyping && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="sc-inputbar">
        <div className="sc-shield-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="18" height="18">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <textarea
          className="sc-input"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
        />
        <button
          className="sc-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p className="sc-footer-note">All prompts scanned by NVIDIA Nemotron Safety Guard + Regex engine before reaching AI</p>
    </div>
  );
}
