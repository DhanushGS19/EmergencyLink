import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';
import { db } from '../lib/db';
import MapComponent from '../components/Map';
import { Shield, User, Truck, Radio, Hospital as HospitalIcon, Activity } from 'lucide-react';

const LandingPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Demo data for map
  const [hospitals, setHospitals] = useState(db.getHospitals());
  const [ambulances, setAmbulances] = useState(db.getAmbulances());

  // Automatically refresh map data (simulated live)
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(db.getHospitals());
      setAmbulances(db.getAmbulances());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePortalLogin = (role: Role) => {
    if (user && user.role !== role) {
      // If logged in as someone else, logout first (handled automatically by login overwrite, but for clarity)
    }
    login(role);
    navigate(`/${role.toLowerCase()}`);
  };

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      
      {/* Hero Section */}
      <section className="hero-section">
        <Activity size={64} className="text-danger mx-auto mb-4" />
        <h1 className="hero-title">EmergencyLink Enterprise</h1>
        <p className="hero-subtitle">
          Intelligent, real-time emergency coordination for modern hospitals. 
          Connect patients, dispatchers, and ambulance fleets on a single unified platform.
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-danger" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => handlePortalLogin('PATIENT')}>
            Request Emergency Assistance
          </button>
        </div>
      </section>

      {/* Live Coverage Map */}
      <section>
        <h2 className="section-title">Live Network Coverage</h2>
        <div className="map-showcase" style={{ position: 'relative' }}>
          <div className="map-overlay-banner">
            🟢 LIVE: {ambulances.filter(a => a.status === 'AVAILABLE').length} Ambulances Available
          </div>
          <MapComponent 
            center={{ latitude: 40.7128, longitude: -74.0060 }}
            hospitals={hospitals}
            ambulances={ambulances}
            className="map-container"
          />
        </div>
      </section>

      {/* Portals Section */}
      <section>
        <h2 className="section-title">Enterprise Portals</h2>
        <div className="portal-grid">
          
          {/* Patient Portal */}
          <button className="card portal-card danger-card" onClick={() => handlePortalLogin('PATIENT')}>
            <div className="portal-icon-wrapper">
              <User size={32} />
            </div>
            <h3 className="mb-2">Patient Portal</h3>
            <p className="text-sm text-muted">Request emergency assistance, share location, and track ambulance ETA.</p>
          </button>

          {/* Driver Portal */}
          <button className="card portal-card" onClick={() => handlePortalLogin('DRIVER')}>
            <div className="portal-icon-wrapper">
              <Truck size={32} />
            </div>
            <h3 className="mb-2">Ambulance Fleet</h3>
            <p className="text-sm text-muted">Driver dashboard for route navigation, status updates, and patient onboarding.</p>
          </button>

          {/* Dispatcher Portal */}
          <button className="card portal-card" onClick={() => handlePortalLogin('DISPATCHER')}>
            <div className="portal-icon-wrapper">
              <Radio size={32} />
            </div>
            <h3 className="mb-2">Dispatch Center</h3>
            <p className="text-sm text-muted">Command center for fleet management, manual assignments, and environmental monitoring.</p>
          </button>

          {/* Hospital Portal */}
          <button className="card portal-card" onClick={() => handlePortalLogin('HOSPITAL')}>
            <div className="portal-icon-wrapper">
              <HospitalIcon size={32} />
            </div>
            <h3 className="mb-2">Hospital Administration</h3>
            <p className="text-sm text-muted">Manage hospital capacity, update emergency services, and monitor incoming patients.</p>
          </button>

          {/* Admin Portal */}
          <button className="card portal-card" onClick={() => handlePortalLogin('ADMIN')}>
            <div className="portal-icon-wrapper text-danger">
              <Shield size={32} />
            </div>
            <h3 className="mb-2">System Admin</h3>
            <p className="text-sm text-muted">Manage the EmergencyLink platform, configure demo data, and oversee all nodes.</p>
          </button>
          
        </div>
      </section>

      <div className="alert alert-warning" style={{ fontSize: '0.875rem', textAlign: 'center', margin: '4rem auto 2rem auto', maxWidth: '600px' }}>
        <strong>DEMO MODE:</strong> This is a local prototype using browser storage. Logging into a portal automatically authenticates you as a demo user for that role.
      </div>

    </div>
  );
};

export default LandingPage;
