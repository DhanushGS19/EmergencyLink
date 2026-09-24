import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { Hospital, Ambulance } from '../types';
import { Shield } from 'lucide-react';

const AdminDashboard = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

  const refreshData = () => {
    setHospitals(db.getHospitals());
    setAmbulances(db.getAmbulances());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const resetDemoData = () => {
    if (window.confirm("Are you sure you want to reset all data to default demo state?")) {
      db.reset();
      refreshData();
    }
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h2><Shield className="inline-block mr-2 text-danger" /> Admin Dashboard</h2>
        <button className="btn btn-danger" onClick={resetDemoData}>
          Reset Demo Data
        </button>
      </div>

      <div className="alert alert-warning mb-4">
        <strong>DEMO DATA:</strong> Ambulance and hospital availability shown here is simulated for prototype purposes.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3>Hospitals</h3>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{hospitals.length}</span>
          </div>
          <div className="flex-col gap-2">
            {hospitals.map(h => (
              <div key={h.id} className="p-3 bg-opacity-10 rounded border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <strong>{h.name}</strong>
                <p className="text-sm text-muted">{h.address}</p>
                <p className="text-sm">Status: <span className={`text-${h.status === 'AVAILABLE' ? 'success' : 'danger'}`}>{h.status}</span></p>
                <div className="mt-2 flex gap-2">
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit (Demo)</button>
                  <button className="btn btn-secondary text-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3>Ambulances</h3>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{ambulances.length}</span>
          </div>
          <div className="flex-col gap-2">
            {ambulances.map(a => (
              <div key={a.id} className="p-3 bg-opacity-10 rounded border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <strong>{a.ambulance_number}</strong>
                <p className="text-sm text-muted">Driver: {a.driver_name}</p>
                <p className="text-sm">Status: <span>{a.status}</span></p>
                <div className="mt-2 flex gap-2">
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit (Demo)</button>
                  <button className="btn btn-secondary text-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
