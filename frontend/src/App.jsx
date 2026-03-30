import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ThreatDetection from './pages/ThreatDetection';
import PayloadAnalytics from './pages/PayloadAnalytics';
import DefensePolicies from './pages/DefensePolicies';
import RedTeaming from './pages/RedTeaming';
import SecureChat from './pages/SecureChat';
import './index.css';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detect" element={<ThreatDetection />} />
          <Route path="/analytics" element={<PayloadAnalytics />} />
          <Route path="/policies" element={<DefensePolicies />} />
          <Route path="/redteam" element={<RedTeaming />} />
          <Route path="/chat" element={<SecureChat />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
