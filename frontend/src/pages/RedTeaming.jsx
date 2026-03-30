export default function RedTeaming() {
  return (
    <div className="page-container">
      <h1 className="page-title">Red Teaming</h1>
      <div className="dashboard-grid">
        <div className="panel col-span-2">
          <div className="panel-header"><h3>Automated Attack Runner</h3></div>
          <p className="text-dim" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
             Select a payload dataset to simulate attacks on your connected models to evaluate security robustness.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-primary">Run Jailbreak Datasets</button>
             <button className="btn btn-secondary">Upload Custom CSV</button>
          </div>
        </div>
        
        <div className="panel">
          <div className="panel-header"><h3>Known Detected Attacks</h3></div>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <li style={{ display: 'flex', justifyContent: 'space-between'}}><span>Awesome Roleplay</span> <span className="text-blue">94%</span></li>
             <li style={{ display: 'flex', justifyContent: 'space-between'}}><span>Developer Mode</span> <span className="text-blue">88%</span></li>
             <li style={{ display: 'flex', justifyContent: 'space-between'}}><span>System Override</span> <span className="text-blue">72%</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
