export default function Dashboard() {
  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      <div className="dashboard-grid">
        <div className="panel">
           <span className="text-dim">Total Payload Scanned</span>
           <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>856,213</h2>
        </div>
        <div className="panel">
           <span className="text-dim">Threats Blocked</span>
           <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>3,841</h2>
        </div>
        <div className="panel">
           <span className="text-dim">Threat Bypass Rate</span>
           <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--yellow)' }}>12.5%</h2>
        </div>
        <div className="panel">
           <span className="text-dim">Avg Latency</span>
           <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--blue)' }}>97ms</h2>
        </div>

        <div className="panel col-span-3" style={{ height: '300px' }}>
          <div className="panel-header"><h3>Malicious Attacks vs Benign Requests</h3></div>
          <p className="text-dim">Chart coming soon...</p>
        </div>
      </div>
    </div>
  );
}
