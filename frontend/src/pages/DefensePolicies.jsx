export default function DefensePolicies() {
  return (
    <div className="page-container">
      <h1 className="page-title">Defense Policies</h1>
      
      <div className="dashboard-grid">
        <div className="panel col-span-2">
          <div className="panel-header"><h3>Protocol Shields</h3></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h4 style={{ fontWeight: 500 }}>Sensitive Data Shield</h4>
                   <span className="text-dim" style={{ fontSize: '0.8rem' }}>Prevents PII and secrets from leaking.</span>
                </div>
                <div className="toggle-switch">
                  <div className="toggle-track active"><div className="toggle-thumb"></div></div>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h4 style={{ fontWeight: 500 }}>Syntax Injection Shield</h4>
                   <span className="text-dim" style={{ fontSize: '0.8rem' }}>Blocks SQLi and prompt overrides.</span>
                </div>
                <div className="toggle-switch">
                  <div className="toggle-track active"><div className="toggle-thumb"></div></div>
                </div>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h4 style={{ fontWeight: 500 }}>Roleplay Jailbreak Shield</h4>
                   <span className="text-dim" style={{ fontSize: '0.8rem' }}>Detects DAN, Developer Mode bypasses.</span>
                </div>
                <div className="toggle-switch">
                  <div className="toggle-track active"><div className="toggle-thumb"></div></div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="panel">
           <div className="panel-header"><h3>Custom Prompt Blacklists</h3></div>
           <p className="text-dim" style={{ fontSize: '0.85rem' }}>No custom rules currently active.</p>
           <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>+ Add Rule</button>
        </div>
      </div>
    </div>
  );
}
