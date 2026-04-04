import { useState, useRef } from 'react';

export default function RedTeaming() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Red Teaming</h1>
      <div className="dashboard-grid">
        <div className="panel col-span-2">
          <div className="panel-header"><h3>Automated Attack Runner</h3></div>
          <p className="text-dim" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
             Select a payload dataset to simulate attacks on your connected models to evaluate security robustness.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <button className="btn btn-primary">Run Jailbreak Datasets</button>
             
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               style={{ display: 'none' }} 
               accept=".csv"
             />
             
             <button 
               className="btn-faded" 
               onClick={handleUploadClick}
             >
               {selectedFile ? `📎 ${selectedFile.name}` : 'Upload Custom CSV'}
               <svg style={{ marginLeft: '4px', opacity: 0.5 }} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M1 1L5 5L9 1" />
               </svg>
             </button>
             
             {selectedFile && (
               <span 
                 onClick={() => setSelectedFile(null)} 
                 style={{ cursor: 'pointer', color: '#ff5f38', fontSize: '1.2rem', lineHeight: 1 }}
               >×</span>
             )}
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
