import { useState, useRef, useEffect } from 'react';
import Globe from '../components/Globe';

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
export default function Dashboard() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const hasStarted = messages.length > 0;

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

    try {
      // Send the actual conversation history
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role, content: m.content }));


      // Use FormData for FastAPI endpoint expecting form fields
      const formData = new FormData();
      formData.append('prompt', text || '');
      formData.append('history', JSON.stringify(history || []));
      const res = await fetch('http://localhost:8000/api/secure-chat', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.status === 'blocked') {
        setMessages(prev => [...prev, {
          role: 'blocked',
          level: data.risk_score > 85 ? 'critical' : data.risk_score > 60 ? 'high' : 'medium',
          description: data.message,
          score: data.risk_score,
          threats: data.threats_found || [],
          time: now(),
        }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.reply, score: data.risk_score, time: now() }]);

    } catch (err) {
      setIsTyping(false);
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
    <div className="sc-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* ── Landing State / Chat Messages ── */}
      <div className="dynamic-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {!hasStarted ? (
          // Landing View
          <div className="landing-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '300px', height: '300px', marginBottom: '1rem' }}>
               <Globe />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 600, color: '#fff', marginBottom: '2rem' }}>How can I help u?</h1>
          </div>
        ) : (
          // Chat View - Let the sc-messages class manage its own overflow as defined in index.css
          <div className="sc-messages" style={{ padding: '1rem 15%', boxSizing: 'border-box' }}>
            {/* System welcome only visible once chatting has started */}
            <Message msg={{
              role: 'ai',
              content: "Hello! I'm your PromptVeil-secured AI assistant. Every message you send is scanned by the dual-layer defense engine before reaching the AI. Ask me anything!",
              time: now(),
            }} />
            
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {isTyping && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Premium Input Area ── */}
      <div className="input-container-pinned" style={{ padding: '0 15% 2rem 15%', boxSizing: 'border-box', width: '100%', transition: 'all 0.3s' }}>
        <div className={`sc-input-glow-wrap ${inputFocused ? 'focused' : ''}`} style={{ borderRadius: '24px' }}>
          <div className="sc-input-inner" style={{ borderRadius: '22px', background: '#12151f', padding: '1rem 1.25rem 0.8rem' }}>
            <textarea
              ref={textareaRef}
              className="sc-glow-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Message Gemini..."
              style={{ fontSize: '1rem' }}
            />

            <div className="sc-toolbar" style={{ marginTop: '0.8rem' }}>
              <div className="sc-toolbar-left">
                <button className="sc-tool-btn" title="Attach">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button className="sc-tools-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  Tools
                </button>
              </div>

              <div className="sc-toolbar-right">
                <button className="sc-mic-btn" title="Voice input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
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
      </div>
    </div>
  );
}
