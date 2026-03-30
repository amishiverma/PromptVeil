import { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([
    { msg: "PromptVeil v2.0 initialized.", type: 'info' },
    { msg: "Defense protocols loaded. Awaiting input...", type: 'info' },
  ]);
  const [scanCount, setScanCount] = useState(0);
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const logRef = useRef(null);

  // Protocol states derived from scan results
  const [protocols, setProtocols] = useState({
    sql_injection: { status: 'STANDBY', count: 0 },
    system_override: { status: 'MONITORING', count: 0 },
    jailbreak: { status: 'STANDBY', count: 0 },
    data_exfiltration: { status: 'STANDBY', count: 0 },
    code_execution: { status: 'STANDBY', count: 0 },
  });

  const [riskScore, setRiskScore] = useState(0);
  const [riskHistory, setRiskHistory] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { msg: `[${timestamp}] ${msg}`, type }].slice(-15));
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAlertVisible(false);
    setScanCount(prev => prev + 1);
    addLog(`Scanning payload: "${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}"`, 'info');
    addLog("Running threat analysis across 5 vectors...", 'warning');

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      // Simulate processing delay for UX
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
        setRiskScore(data.risk_score || 0);
        setRiskHistory(prev => [...prev.slice(-4), data.risk_score || 0]);

        if (data.is_safe) {
          addLog("✓ VERDICT: SAFE — No threats detected.", 'success');
          addLog(`Recommendation: ${data.recommendation}`, 'success');
          // Log AI model verdict for safe prompts too
          if (data.ai_analysis?.available) {
            addLog(`🤖 AI Model: ${data.ai_analysis.verdict?.substring(0, 80)}`, 'info');
          }
        } else {
          setThreatsBlocked(prev => prev + data.threats_found.length);
          addLog(`✗ ALERT: ${data.threats_found.length} threat(s) detected!`, 'error');
          addLog(`Risk Score: ${data.risk_score}/100 — Level: ${data.threat_level.toUpperCase()}`, 'error');
          addLog(`Recommendation: ${data.recommendation}`, 'warning');

          // Log AI model verdict
          if (data.ai_analysis?.available) {
            addLog(`🤖 AI Safety Guard: ${data.ai_analysis.verdict?.substring(0, 100)}`, 'error');
            if (data.ai_analysis.categories?.length > 0) {
              addLog(`  AI Categories: ${data.ai_analysis.categories.join(', ')}`, 'warning');
            }
          }

          // Show alert banner
          setAlertData(data);
          setAlertVisible(true);

          // Update protocol states based on threats found
          setProtocols(prev => {
            const updated = { ...prev };
            for (const threatType of data.threats_found) {
              if (updated[threatType]) {
                const detail = data.threat_details[threatType];
                updated[threatType] = {
                  status: detail.status,
                  count: (prev[threatType]?.count || 0) + detail.matches,
                };
                addLog(`  → ${detail.label}: ${detail.status} (${detail.matches} match${detail.matches > 1 ? 'es' : ''}, severity: ${detail.severity})`, 'error');
              }
            }
            return updated;
          });
        }
      }, 1800);
    } catch (error) {
      console.error('Error:', error);
      setIsAnalyzing(false);
      addLog("Connection failed. Backend unreachable.", 'error');
    }
  };

  const dismissAlert = () => setAlertVisible(false);

  const getProtocolStatus = (key) => {
    const p = protocols[key];
    if (p.count > 0) return { text: `BLOCKED (${p.count})`, class: 'red' };
    if (isAnalyzing) return { text: 'SCANNING...', class: 'cyan' };
    return { text: p.status, class: 'gray' };
  };

  const getThreatLevelColor = () => {
    if (!result) return 'var(--cyan)';
    if (result.risk_score > 60) return 'var(--red)';
    if (result.risk_score > 25) return '#fbbf24';
    return 'var(--green)';
  };

  const getRiskGaugeOffset = () => {
    // 163 is full circumference of circle r=26
    const progress = (riskScore / 100) * 163;
    return 163 - progress;
  };

  return (
    <div className="hq-container">

      {/* THREAT ALERT BANNER */}
      {alertVisible && alertData && (
        <div className={`alert-banner threat-${alertData.threat_level}`}>
          <div className="alert-content">
            <span className="alert-icon">⚠</span>
            <div className="alert-text">
              <strong>THREAT DETECTED — Level: {alertData.threat_level.toUpperCase()}</strong>
              <span>{alertData.description}</span>
            </div>
            <button className="alert-dismiss" onClick={dismissAlert}>✕</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="hq-header">
        <div className="header-left">
           <div className="deco-lines"></div>
        </div>
        <div className="header-center">
          <div className="logo-box">
             <div className="hex-icon"></div>
             <h1>PROMPT<span>VEIL</span></h1>
          </div>
          <div className="logo-sub">L.L.M. SECURITY MAINFRAME</div>
        </div>
        <div className="header-right">
          <span className="stat">
            <span className="stat-dot green"></span>
            SCANS: <span className="text-cyan">{scanCount}</span>
          </span>
          <span className="stat">
            <span className="stat-dot red"></span>
            BLOCKED: <span className="text-red">{threatsBlocked}</span>
          </span>
          <span className="stat">
            <span className="stat-dot"></span>
            STATUS: <span className="text-green">ONLINE</span>
          </span>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="hq-grid">

        {/* LEFT COLUMN */}
        <div className="hq-col col-left">
          {/* Ask PromptVeil */}
          <div className="sci-panel payload-panel">
             <div className="sci-header">
                <span className="cyan-dot"></span> ASK PROMPTVEIL
                <div className="sys-status">
                  {isAnalyzing ? (
                    <span className="scanning-indicator">ANALYZING</span>
                  ) : (
                    <>SYSTEM <span className="sys-bar"></span> 100%</>
                  )}
                </div>
             </div>
             <div className="sci-body">
                <textarea
                  className="sci-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt to analyze for security threats..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) handleAnalyze();
                  }}
                />

                <div className="payload-controls">
                  <button
                    className={`btn-scan ${isAnalyzing ? 'scanning' : ''} ${result && !result.is_safe ? 'threat-found' : ''}`}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !prompt.trim()}
                  >
                    {isAnalyzing ? '⟳ SCANNING...' : 'ANALYZE PROMPT'}
                  </button>
                  <div className="origin-context">
                    <div className="oc-title">SCAN INFO</div>
                    <div className="oc-data">Vectors: <span className="text-cyan">5 active</span></div>
                    <div className="oc-data">Ctrl+Enter to scan</div>
                  </div>
                </div>

                {/* Quick result badge */}
                {result && !isAnalyzing && (
                  <div className={`result-badge ${result.is_safe ? 'safe' : 'unsafe'}`}>
                    <span className="rb-icon">{result.is_safe ? '✓' : '✗'}</span>
                    <span className="rb-text">
                      {result.is_safe ? 'SAFE — No threats' : `${result.threats_found.length} THREAT(S) — Risk: ${result.risk_score}/100`}
                    </span>
                  </div>
                )}
             </div>
          </div>

          {/* Risk Trend */}
          <div className="sci-panel trend-panel">
            <div className="sci-header">
                <span className="cyan-dot"></span> RISK TREND
            </div>
            <div className="sci-body p-0 relative">
               <div className="trend-chart">
                 {riskHistory.map((val, i) => (
                   <div key={i} className="trend-bar-container">
                     <div
                       className="trend-bar"
                       style={{
                         height: `${Math.max(val, 3)}%`,
                         background: val > 60 ? 'var(--red)' : val > 25 ? '#fbbf24' : 'var(--green)',
                         boxShadow: `0 0 8px ${val > 60 ? 'var(--red-dim)' : val > 25 ? 'rgba(251,191,36,0.3)' : 'var(--green-dim)'}`,
                       }}
                     ></div>
                     <span className="trend-label">#{scanCount - 4 + i > 0 ? scanCount - 4 + i : '-'}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="hq-col col-center">
           <div className="sci-panel visualizer-panel">
              <div className="sci-header">
                  <span className="cyan-dot"></span> THREAT FLOW VISUALIZER
              </div>
              <div className="visualizer-content">

                 <div className="v-stats left">
                   <div className="v-stat-box">
                      <div className="v-lbl">TOTAL SCANS:</div>
                      <div className="v-val">{scanCount}</div>
                   </div>
                   <div className="v-stat-box">
                      <div className="v-lbl">SAFE RATE:</div>
                      <div className="v-val text-green">{scanCount > 0 ? Math.round(((scanCount - threatsBlocked) / scanCount) * 100) : 100}%</div>
                   </div>
                 </div>

                 {/* The Core Orb System */}
                 <div className={`orb-system ${isAnalyzing ? 'active' : ''} ${result && !result.is_safe ? 'threat' : ''}`}>
                    <div className="orb-bg-glow"></div>
                    <div className="orb-sphere"></div>
                    <div className="orb-ring ring-1"></div>
                    <div className="orb-ring ring-2"></div>
                    <div className="orb-ring ring-3"></div>
                    <div className="orb-hex-core">
                      <div className="hex-inner"></div>
                    </div>
                 </div>

                 {/* Attack vector labels during analysis */}
                 {isAnalyzing && (
                   <div className="attack-arrows">
                     <div className="arr red a1">ANALYZING <span>→</span></div>
                     <div className="arr red a2">SCANNING <span>→</span></div>
                   </div>
                 )}
                 {result && !result.is_safe && !isAnalyzing && (
                   <div className="attack-arrows active">
                     {result.threats_found.map((t, i) => (
                       <div key={i} className="arr red">{result.threat_details[t]?.label?.toUpperCase() || t} <span>✗</span></div>
                     ))}
                   </div>
                 )}

                 <div className="v-stats right">
                   <div className="v-stat-box risk-box">
                      <div className="v-lbl">RISK LEVEL</div>
                      <div className="v-val" style={{ color: getThreatLevelColor() }}>
                        {result ? result.threat_level.toUpperCase() : 'NONE'}
                      </div>
                   </div>
                   <div className="v-stat-box">
                      <div className="v-lbl">THREATS BLOCKED</div>
                      <div className="v-val text-red">{threatsBlocked}</div>
                   </div>
                 </div>

              </div>
           </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="hq-col col-right">

          {/* Active Defense Protocols */}
          <div className="sci-panel protocols-panel">
             <div className="sci-header">
                <span className="red-dot"></span> ACTIVE DEFENSE PROTOCOLS
             </div>
             <div className="sci-body protocol-list">

                {/* SQL Injection */}
                {(() => {
                  const s = getProtocolStatus('sql_injection');
                  return (
                    <div className={`proto-card ${s.class}-card ${result && result.threats_found?.includes('sql_injection') ? 'flashing' : ''}`}>
                      <div className={`pc-icon ${s.class}-bg`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </div>
                      <div className="pc-content">
                        <div className="pc-head">
                           <h4>SQL Injection</h4>
                           <span className={`pc-badge ${s.class}-badge`}>{s.text}</span>
                        </div>
                        <div className="pc-sub">Database attack mitigation</div>
                      </div>
                      <div className={`pc-graph ${s.class}-graph`}></div>
                    </div>
                  );
                })()}

                {/* System Override */}
                {(() => {
                  const s = getProtocolStatus('system_override');
                  return (
                    <div className={`proto-card ${s.class}-card ${result && result.threats_found?.includes('system_override') ? 'flashing' : ''}`}>
                      <div className={`pc-icon ${s.class}-bg`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                      </div>
                      <div className="pc-content">
                        <div className="pc-head">
                           <h4>System Override</h4>
                           <span className={`pc-badge ${s.class}-badge`}>{s.text}</span>
                        </div>
                        <div className="pc-sub">Prompt extraction defense</div>
                      </div>
                      <div className={`pc-graph ${s.class}-graph`}></div>
                    </div>
                  );
                })()}

                {/* Jailbreak Heuristics */}
                {(() => {
                  const s = getProtocolStatus('jailbreak');
                  return (
                    <div className={`proto-card ${s.class}-card ${result && result.threats_found?.includes('jailbreak') ? 'flashing' : ''}`}>
                      <div className={`pc-icon ${s.class}-bg`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                      <div className="pc-content">
                        <div className="pc-head">
                           <h4>Jailbreak Heuristics</h4>
                           <span className={`pc-badge ${s.class}-badge`}>{s.text}</span>
                        </div>
                        <div className="pc-sub">Behavioral bypass detection</div>
                      </div>
                      <div className={`pc-graph ${s.class}-graph`}></div>
                    </div>
                  );
                })()}

                {/* Code Execution */}
                {(() => {
                  const s = getProtocolStatus('code_execution');
                  return (
                    <div className={`proto-card ${s.class}-card ${result && result.threats_found?.includes('code_execution') ? 'flashing' : ''}`}>
                      <div className={`pc-icon ${s.class}-bg`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      </div>
                      <div className="pc-content">
                        <div className="pc-head">
                           <h4>Code Execution</h4>
                           <span className={`pc-badge ${s.class}-badge`}>{s.text}</span>
                        </div>
                        <div className="pc-sub">Injection & XSS prevention</div>
                      </div>
                      <div className={`pc-graph ${s.class}-graph`}></div>
                    </div>
                  );
                })()}

             </div>
          </div>

          {/* Intelligence Report Terminal */}
          <div className="sci-panel terminal-panel">
             <div className="sci-header">
                <span className="red-dot"></span> INTELLIGENCE REPORT
             </div>
             <div className="sci-body terminal-body">
                <div className="terminal-log" ref={logRef}>
                   {logs.map((log, i) => (
                      <div key={i} className={`log-line log-${log.type}`}>
                        {typeof log === 'string' ? log : log.msg}
                      </div>
                   ))}
                   {isAnalyzing && <div className="log-line log-warning blink">▶ Processing threat analysis...</div>}
                </div>
                <div className="risk-score">
                   <div className="rs-gauge">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                         <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"></circle>
                         <circle
                           cx="30" cy="30" r="26" fill="none"
                           stroke={getThreatLevelColor()}
                           strokeWidth="4"
                           strokeDasharray="163"
                           strokeDashoffset={getRiskGaugeOffset()}
                           strokeLinecap="round"
                           style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
                         ></circle>
                      </svg>
                      <div className="rs-val" style={{ color: getThreatLevelColor() }}>{riskScore}</div>
                   </div>
                   <div className="rs-lbl">Risk Score<br/>(0-100)</div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
