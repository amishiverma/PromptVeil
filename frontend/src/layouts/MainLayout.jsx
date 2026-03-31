import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="app-container">
      <header className="top-nav">
        <nav className="nav-menu-top">
          <Link to="/" className={`nav-item-top ${isActive('/')}`}>dashboard</Link>
          <Link to="/detect" className={`nav-item-top ${isActive('/detect')}`}>threat detection</Link>
          <Link to="/analytics" className={`nav-item-top ${isActive('/analytics')}`}>payload</Link>
          <Link to="/analytics" className={`nav-item-top ${isActive('/analytics-full')}`}>analytics</Link>
          <Link to="/policies" className={`nav-item-top ${isActive('/policies')}`}>defense politics</Link>
          <Link to="/redteam" className={`nav-item-top ${isActive('/redteam')}`}>red teaming</Link>
        </nav>
        
        <div className="top-right">
          <div className="user-dropdown">
            <span>marko@see.design</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <div className="scroll-content" style={{ height: '100%', overflowY: 'auto', padding: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
