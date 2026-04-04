import React from 'react';

/**
 * The 'Balanced Siri Orb' component.
 * Features an equal visual division of 'Electric Blue', 'Pure White', and 'Vivid Orange' gradient flows.
 * The motion is synchronized with 120-degree phase offsets for a perfect trifecta flow.
 */
export default function Globe({ className }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="balanced-siri-container">
        {/* Equal Trifecta - Blindingly Bright Blue, White, and Orange Bands */}
        <div className="siri-blob siri-blob-blue"></div>
        <div className="siri-blob siri-blob-white"></div>
        <div className="siri-blob siri-blob-orange"></div>
        
        {/* Rapid Motion Flares - Blining tiny sparks */}
        <div className="siri-motion-flare siri-flare-1"></div>
        <div className="siri-motion-flare siri-flare-2"></div>
        
        {/* Luminous atmosphere & Overlays */}
        <div className="siri-central-diffuser"></div>
        <div className="siri-bloom-glow"></div>
        
        {/* Ultra-High-Gloss Glass Overlays */}
        <div className="siri-gloss-highlight"></div>
        <div className="siri-specular-flare"></div>
        <div className="siri-specular-glint"></div>
        <div className="siri-glass-arc"></div>
        <div className="siri-rim-polish"></div>
      </div>

      <style>{`
        .balanced-siri-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #000;
          backdrop-filter: blur(60px);
          -webkit-backdrop-filter: blur(60px);
          
          /* Blinding Surface Definition & Contrast Pop */
          filter: blur(1.5px) brightness(1.6) contrast(1.3);
          
          /* Intense Crystalline Atmospheric Glow */
          box-shadow: 
            0 0 60px rgba(255, 255, 255, 0.4),
            0 0 120px rgba(0, 114, 255, 0.2),
            0 0 140px rgba(255, 120, 0, 0.1),
            inset 0 0 100px rgba(0, 0, 0, 1);
          
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .siri-blob {
          position: absolute;
          border-radius: 40% 60% 60% 40% / 40% 45% 55% 60%;
          mix-blend-mode: screen;
          opacity: 1.0;
          width: 180%;
          height: 180%;
          background-size: 250% 250%; /* Larger for internal flow */
          filter: blur(8px);
          animation: rapid-liquid-swirl 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* EQUAL DIVISION LAYERS - HIGH VELOCITY FLOW */
        .siri-blob-blue {
          background: radial-gradient(circle, #00f2ff 0%, #0047ab 45%, #000080 70%, transparent 85%);
          top: -35%;
          left: -35%;
          animation-delay: 0s;
        }

        .siri-blob-white {
          background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.8) 40%, transparent 80%);
          bottom: -35%;
          right: -35%;
          animation-delay: -2s; /* 1/3rd of 6s */
        }

        .siri-blob-orange {
          background: radial-gradient(circle, #ffae00 0%, #ff8c00 45%, #ff4500 70%, transparent 75%);
          top: 35%;
          right: 35%;
          animation-delay: -4s; /* 2/3rd of 6s */
        }

        /* HIGH-SPEED MOTION SPARKS */
        .siri-motion-flare {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(0px) drop-shadow(0 0 6px #ffffff);
          opacity: 1;
          z-index: 8;
        }

        .siri-flare-1 {
          animation: spark-orbit 3s linear infinite;
        }

        .siri-flare-2 {
          animation: spark-orbit 4s linear infinite reverse;
        }

        .siri-bloom-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 80%);
          mix-blend-mode: color-dodge;
          z-index: 6;
          pointer-events: none;
        }

        .siri-central-diffuser {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
          z-index: 5;
        }

        /* ULTRA-HIGH-GLOSS OVERLAYS */
        .siri-gloss-highlight {
          position: absolute;
          top: 5%;
          left: 5%;
          width: 70%;
          height: 50%;
          background: radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
          border-radius: 50% 50% 40% 40%;
          filter: blur(8px);
          z-index: 10;
          pointer-events: none;
          transform: rotate(-10deg);
        }

        .siri-glass-arc {
          position: absolute;
          top: 4%;
          left: 12%;
          width: 75%;
          height: 45%;
          border-top: 2.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          filter: blur(1.5px); 
          z-index: 11;
          pointer-events: none;
          transform: rotate(-18deg);
        }

        .siri-specular-flare {
          position: absolute;
          top: 7%;
          left: 16%;
          width: 32%;
          height: 20%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 80%);
          border-radius: 50%;
          filter: blur(1.2px); 
          z-index: 12;
          pointer-events: none;
        }

        .siri-specular-glint {
          position: absolute;
          top: 8%;
          left: 18%;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border-radius: 50%;
          filter: blur(0px) drop-shadow(0 0 10px white); 
          z-index: 13;
          pointer-events: none;
          opacity: 1;
        }

        .siri-rim-polish {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow: 
            inset 0 0 50px rgba(255, 255, 255, 0.35),
            inset 50px -50px 100px rgba(0, 0, 0, 0.95), 
            inset -6px 6px 6px rgba(255, 255, 255, 0.5); 
          z-index: 14;
          pointer-events: none;
        }

        @keyframes rapid-liquid-swirl {
          0% { 
            transform: rotate(0deg) translate(0%, 0%) scale(1.1) skew(0deg); 
            background-position: 0% 0%; 
          }
          33% { 
            transform: rotate(120deg) translate(20%, -15%) scale(1.7) skew(15deg); 
            background-position: 100% 50%; 
          }
          66% { 
            transform: rotate(240deg) translate(-15%, 20%) scale(0.7) skew(-15deg); 
            background-position: 50% 100%; 
          }
          100% { 
            transform: rotate(360deg) translate(0%, 0%) scale(1.1) skew(0deg); 
            background-position: 0% 0%; 
          }
        }

        @keyframes spark-orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
