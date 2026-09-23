import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { Ambulance, EmergencyRequest, Hospital } from '../types';
import MapComponent from '../components/Map';
import { Navigation, Phone, CheckCircle } from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    setHospitals(db.getHospitals());
  }, []);

  // Poll for ambulance and request data
  useEffect(() => {
    if (!user) return;
    
    const poll = () => {
      const ambs = db.getAmbulances();
      const myAmb = ambs.find(a => a.driver_id === user.id);
      if (myAmb) {
        setAmbulance(myAmb);
        
        const reqs = db.getRequests();
        const active = reqs.find(r => r.ambulance_id === myAmb.id && r.status !== 'COMPLETED');
        setActiveRequest(active || null);
      }
    };
    
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleStatus = () => {
    if (ambulance) {
      const newStatus = ambulance.status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
      db.updateAmbulance(ambulance.id, { status: newStatus });
      setAmbulance({ ...ambulance, status: newStatus });
    }
  };

  const updateRequestStatus = (status: EmergencyRequest['status']) => {
    if (activeRequest) {
      db.updateRequest(activeRequest.id, { status });
      setActiveRequest({ ...activeRequest, status });
    }
  };

  const assignHospital = (hospId: string) => {
    if (activeRequest) {
      db.updateRequest(activeRequest.id, { hospital_id: hospId });
      setActiveRequest({ ...activeRequest, hospital_id: hospId });
    }
  };

  const openNavigation = (lat: number, lng: number) => {
    // Standard maps URL, opens external app on mobile or new tab on desktop
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!ambulance) {
    return <div className="container mt-4 text-center">Loading driver profile...</div>;
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h2>Driver Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className={`badge badge-${ambulance.status.toLowerCase()}`}>
            {ambulance.status}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={toggleStatus}
            disabled={ambulance.status === 'ON_EMERGENCY' || ambulance.status === 'BUSY'}
          >
            Go {ambulance.status === 'AVAILABLE' ? 'Offline' : 'Online'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4" style={{ md: { gridTemplateColumns: '1fr 2fr' } }}>
        <div className="card">
          {!activeRequest ? (
            <div className="text-center py-4 text-muted">
              <CheckCircle size={48} className="mx-auto mb-3" />
              <h3>No Active Emergencies</h3>
              <p>Waiting for dispatch...</p>
            </div>
          ) : (
            <div>
              <div className="alert alert-warning mb-4">
                <h3 className="mb-2 text-white">EMERGENCY RECEIVED</h3>
                <p><strong>Patient:</strong> {activeRequest.patient_name}</p>
                <p><strong>Type:</strong> {activeRequest.emergency_type}</p>
                <p><strong>Condition:</strong> {activeRequest.condition}</p>
              </div>

              <div className="flex-col gap-2 mb-4">
                <a href={`tel:${activeRequest.emergency_contact_phone}`} className="btn btn-secondary w-full">
                  <Phone size={18} /> Contact Patient/Emergency Contact
                </a>
                
                {activeRequest.status !== 'ARRIVED_AT_HOSPITAL' && (
                   <button 
                     className="btn btn-primary w-full mt-2"
                     onClick={() => openNavigation(activeRequest.location.latitude, activeRequest.location.longitude)}
                   >
                     <Navigation size={18} /> Open External Navigation
                   </button>
                )}
              </div>

              <h4 className="mb-2 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Update Status</h4>
              <div className="flex-col gap-2">
                {activeRequest.status === 'PENDING' && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('ACCEPTED')}>Accept Request</button>
                )}
                {activeRequest.status === 'ACCEPTED' && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('GOING_TO_PATIENT')}>Start Journey to Patient</button>
                )}
                {activeRequest.status === 'GOING_TO_PATIENT' && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('ARRIVED')}>Mark Arrived</button>
                )}
                {activeRequest.status === 'ARRIVED' && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('PATIENT_ONBOARD')}>Patient Onboard</button>
                )}
                
                {activeRequest.status === 'PATIENT_ONBOARD' && !activeRequest.hospital_id && (
                  <div className="mt-3">
                    <label className="form-label">Select Destination Hospital</label>
                    <select 
                      className="form-control mb-2" 
                      onChange={(e) => assignHospital(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Hospital...</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {activeRequest.status === 'PATIENT_ONBOARD' && activeRequest.hospital_id && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('GOING_TO_HOSPITAL')}>Start Journey to Hospital</button>
                )}

                {activeRequest.status === 'GOING_TO_HOSPITAL' && (
                  <button className="btn btn-primary" onClick={() => updateRequestStatus('ARRIVED_AT_HOSPITAL')}>Arrived at Hospital</button>
                )}

                {activeRequest.status === 'ARRIVED_AT_HOSPITAL' && (
                  <button className="btn btn-success" style={{ backgroundColor: 'var(--status-available)', color: 'white' }} onClick={() => {
                    updateRequestStatus('COMPLETED');
                    db.updateAmbulance(ambulance.id, { status: 'AVAILABLE' });
                    setAmbulance({...ambulance, status: 'AVAILABLE'});
                  }}>
                    Complete Emergency
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
           <MapComponent 
             center={ambulance.location}
             ambulances={[ambulance]}
             patientLocation={activeRequest?.location}
             hospitals={hospitals}
             className="map-container-large"
           />
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
