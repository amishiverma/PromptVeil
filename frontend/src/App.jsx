import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ThreatDetection from './pages/ThreatDetection';
import PayloadAnalytics from './pages/PayloadAnalytics';
import DefensePolicies from './pages/DefensePolicies';
import RedTeaming from './pages/RedTeaming';
import SecureChat from './pages/SecureChat';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/detect"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ThreatDetection />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PayloadAnalytics />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DefensePolicies />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/redteam"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RedTeaming />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SecureChat />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
