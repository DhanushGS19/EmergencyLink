import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { Hospital, EmergencyRequest, Ambulance } from '../types';
import { Building } from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [incoming, setIncoming] = useState<(EmergencyRequest & { ambulance?: Ambulance })[]>([]);

  const refreshData = () => {
    if (!user) return;
    const h = db.getHospitals().find(h => h.id === user.id);
    if (h) {
      setHospital(h);
      
      const reqs = db.getRequests().filter(r => r.hospital_id === h.id && r.status !== 'COMPLETED');
      const ambs = db.getAmbulances();
      
      setIncoming(reqs.map(r => ({
        ...r,
        ambulance: ambs.find(a => a.id === r.ambulance_id)
      })));
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const updateStatus = (status: Hospital['status']) => {
    if (hospital) {
      db.updateHospital(hospital.id, { status });
      setHospital({ ...hospital, status });
    }
  };

  if (!hospital) return <div className="container mt-4 text-center">Loading hospital profile...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-4">
        <h2><Building className="inline-block mr-2" /> Hospital Dashboard</h2>
      </div>

      <div className="card mb-4">
        <h3 className="mb-3">{hospital.name}</h3>
        <p className="text-muted mb-4">{hospital.address} | {hospital.phone}</p>
        
        <div className="form-group">
          <label className="form-label">Hospital Status</label>
          <select 
            className="form-control" 
            value={hospital.status}
            onChange={(e) => updateStatus(e.target.value as any)}
          >
            <option value="AVAILABLE">AVAILABLE - Accepting all emergencies</option>
            <option value="FULL">FULL - Limited capacity</option>
            <option value="UNAVAILABLE">UNAVAILABLE - Not accepting emergencies</option>
          </select>
          <small className="text-muted display-block mt-2">
            Last updated: {new Date(hospital.last_updated).toLocaleTimeString()}
          </small>
        </div>
        
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h4 className="mb-2">Emergency Services</h4>
          <div className="flex gap-2 flex-wrap">
            {hospital.emergency_services.map(s => (
              <span key={s} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mb-3">Incoming Ambulances ({incoming.length})</h3>
      
      {incoming.length === 0 ? (
        <p className="text-muted">No incoming ambulances at this time.</p>
      ) : (
        <div className="flex-col gap-3">
          {incoming.map(req => (
            <div key={req.id} className="card border-l-4" style={{ borderLeft: '4px solid var(--accent-red)' }}>
              <div className="flex justify-between">
                <h4>{req.patient_name}</h4>
                <span className="badge badge-emergency">{req.status.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-sm mt-2"><strong>Type:</strong> {req.emergency_type} | <strong>Condition:</strong> {req.condition}</p>
              
              <div className="mt-3 p-3 bg-opacity-10 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <strong>Ambulance Info</strong>
                {req.ambulance ? (
                  <p className="text-sm mt-1">
                    {req.ambulance.ambulance_number} (Driver: {req.ambulance.driver_name})<br/>
                    Phone: {req.ambulance.phone}
                  </p>
                ) : (
                  <p className="text-sm mt-1 text-muted">Ambulance not yet assigned.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
