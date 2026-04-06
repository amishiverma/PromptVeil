import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="top-nav">
        <nav className="nav-menu-top">
          <Link to="/" className={`nav-item-top ${isActive('/')}`}>dashboard</Link>
          <Link to="/detect" className={`nav-item-top ${isActive('/detect')}`}>threat detection</Link>
          <Link to="/analytics" className={`nav-item-top ${isActive('/analytics')}`}>payload analytics</Link>
          <Link to="/policies" className={`nav-item-top ${isActive('/policies')}`}>defense policies</Link>
          <Link to="/redteam" className={`nav-item-top ${isActive('/redteam')}`}>red teaming</Link>
        </nav>
        
        <div className="top-right">
          <div className="user-dropdown">
            <button 
              className="user-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={user?.email}
            >
              {user?.picture && <img src={user.picture} alt="User" className="user-avatar" />}
              <span>{user?.name || user?.email || 'User'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <strong>{user?.name || 'User'}</strong>
                  <small>{user?.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <div className="scroll-content">
          {children}
        </div>
      </main>
    </div>
  );
}
