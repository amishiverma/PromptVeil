import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Send Google token to backend
      await login(credentialResponse.credential);
      
      // Redirect to dashboard on success
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login with Google');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Failed to load Google Sign-In. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PromptVeil</h1>
          <p className="subtitle">AI Security & Threat Detection Dashboard</p>
        </div>

        <div className="login-content">
          <p className="description">
            Secure your AI applications with advanced prompt injection detection and real-time threat analysis.
          </p>

          <div className="google-signin-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleError}
              text="signin_with"
              theme="dark"
              size="large"
              width="300"
              locale="en"
            />
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Signing in...</p>
            </div>
          )}

          <div className="features-list">
            <h3>Key Features:</h3>
            <ul>
              <li>🛡️ Multi-layer threat detection (regex + AI)</li>
              <li>⚡ Real-time prompt analysis</li>
              <li>📊 Detailed threat analytics</li>
              <li>🎯 Defense policy management</li>
              <li>🔴 Red team simulation</li>
            </ul>
          </div>
        </div>

        <div className="login-footer">
          <p className="terms">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <div className="background-animation">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
        <div className="glow-3"></div>
      </div>
    </div>
  );
}
