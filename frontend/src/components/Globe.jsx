import React from 'react';

export default function Globe({ className }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="motion-ball">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <style>{`
        .motion-ball {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: #0d0f17; /* Matches background so only blobs show */
          overflow: hidden;
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5), 0 0 50px rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.05);
          /* Subtle outer glow to mimic the glass dome */
        }
        
        .motion-ball::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow: inset 0px 4px 15px rgba(255,255,255,0.2);
          z-index: 10;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(25px);
          opacity: 0.8;
          mix-blend-mode: screen;
          animation: float 8s ease-in-out infinite alternate, spin 15s linear infinite;
        }

        /* Green / Cyan blob */
        .blob-1 {
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, #10b981 0%, #38bdf8 80%);
          top: 10%;
          left: 10%;
          animation-duration: 9s, 12s;
        }

        /* Purple / Pink blob */
        .blob-2 {
          width: 160px;
          height: 150px;
          background: radial-gradient(circle, #c084fc 0%, #7c3aed 80%);
          bottom: 10%;
          right: 5%;
          animation-duration: 7s, 14s;
          animation-direction: alternate, reverse;
        }

        /* Blue blob acting as core */
        .blob-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #60a5fa 0%, #2563eb 80%);
          top: 30%;
          left: 30%;
          animation-duration: 11s, 18s;
        }

        @keyframes float {
          0% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.1) translate(15px, -15px); }
          100% { transform: scale(0.95) translate(-15px, 15px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
