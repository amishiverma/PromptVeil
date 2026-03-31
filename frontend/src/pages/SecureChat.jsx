import { useState, useRef, useEffect } from 'react';

// ─── Typing indicator ────────────────────────────────────────────────────────
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

// ─── Message bubble ──────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';

  if (msg.role === 'blocked') {
    return (
      <div className="sc-alert">
        <div className="sc-alert-header">
          <span className="sc-alert-icon">🛡</span>
          <span>PromptVeil Blocked This Request</span>
          <span className={`sc-badge sc-badge--${msg.level}`}>{msg.level?.toUpperCase()}</span>
        </div>
        <p className="sc-alert-body">{msg.description}</p>
        <div className="sc-alert-meta">
          <span>Risk Score: <b style={{ color: '#f97316' }}>{msg.score}/100</b></span>
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
        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        {!isUser && msg.score !== undefined && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
            🛡️ Safety Rating: {msg.score}/100 (Safe)
          </div>
        )}
        <div className="sc-timestamp">{msg.time}</div>
      </div>
      {isUser && <div className="sc-avatar sc-avatar--user">U</div>}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function SecureChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your PromptVeil-secured AI assistant. Every message you send is scanned by the dual-layer defense engine before reaching the AI. Ask me anything!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [scanStatus, setScanStatus] = useState({ text: 'Shields Active', color: '#22c55e' });
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: text, time: now() }]);
    setInput('');
    setIsTyping(true);
    setScanStatus({ text: 'Scanning...', color: '#f59e0b' });

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role, content: m.content }));

      // Use FormData for FastAPI endpoint expecting form fields
      const formData = new FormData();
      formData.append('prompt', text || '');
      formData.append('history', JSON.stringify(history || []));
      // File upload not implemented here, but can be added as: formData.append('file', file)


      // Debug: log FormData content
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const res = await fetch('http://localhost:8000/api/secure-chat', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', res.status, errorText);
        setIsTyping(false);
        setScanStatus({ text: 'Backend Error', color: '#ef4444' });
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `⚠️ Backend error (${res.status}): ${errorText}`,
          time: now(),
        }]);
        return;
      }

      const data = await res.json();
      setIsTyping(false);

      if (data.status === 'blocked') {
        setScanStatus({ text: 'Threat Blocked', color: '#ef4444' });
        setMessages(prev => [...prev, {
          role: 'blocked',
          level: data.risk_score > 85 ? 'critical' : data.risk_score > 60 ? 'high' : 'medium',
          description: data.message,
          score: data.risk_score,
          threats: data.threats_found || [],
          time: now(),
        }]);
        setTimeout(() => setScanStatus({ text: 'Shields Active', color: '#22c55e' }), 3000);
        return;
      }

      setScanStatus({ text: 'Safe — Executed with Gemini', color: '#3b82f6' });
      setMessages(prev => [...prev, { role: 'ai', content: data.reply, score: data.risk_score, time: now() }]);
      setTimeout(() => setScanStatus({ text: 'Shields Active', color: '#22c55e' }), 3000);

    } catch (err) {
      setIsTyping(false);
      setScanStatus({ text: 'Backend Offline', color: '#ef4444' });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ Unable to connect to PromptVeil backend. Make sure the Python server is running on port 8000.',
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

      {/* ── Top header bar ── */}
      <div className="sc-header">
        <div className="sc-header-left">
          <div className="sc-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

      {/* ── Premium Input Area ── */}
      <div className="sc-input-area">

        {/* Glowing gradient border wrapper */}
        <div className={`sc-input-glow-wrap ${inputFocused ? 'focused' : ''}`}>
          <div className="sc-input-inner">

            {/* Top: textarea */}
            <textarea
              ref={textareaRef}
              className="sc-glow-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask anything — PromptVeil will protect you..."
            />

            {/* Bottom toolbar row */}
            <div className="sc-toolbar">
              <div className="sc-toolbar-left">
                {/* + button */}
                <button className="sc-tool-btn" title="Attach">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                {/* Tools chip */}
                <button className="sc-tools-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  Tools
                </button>
              </div>

              <div className="sc-toolbar-right">
                {/* Mic button */}
                <button className="sc-mic-btn" title="Voice input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                {/* Send button - purple circle */}
                <button
                  className="sc-glow-send"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  title="Send"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="sc-footer-note">
          All prompts scanned by NVIDIA Nemotron Safety Guard + Regex engine before reaching AI
        </p>
      </div>
    </div>
  );
}
