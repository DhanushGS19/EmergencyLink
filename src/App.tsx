import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertCircle, LogOut, Home } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DriverDashboard from './pages/DriverDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <AlertCircle className="brand-icon" size={28} />
        EmergencyLink
      </Link>
      <div className="nav-links items-center">
        {user ? (
          <>
            <span className="text-muted hide-on-mobile">Logged in as {user.name} ({user.role})</span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Home size={16} /> Home
          </Link>
        )}
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/patient" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/driver" element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />

              <Route path="/dispatcher" element={
                <ProtectedRoute allowedRoles={['DISPATCHER']}>
                  <DispatcherDashboard />
                </ProtectedRoute>
              } />

              <Route path="/hospital" element={
                <ProtectedRoute allowedRoles={['HOSPITAL']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
