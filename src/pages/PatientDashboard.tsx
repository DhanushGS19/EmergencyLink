import React, { useState, useEffect } from 'react';
import { db, calculateDistance } from '../lib/db';
import type { Location, Ambulance, Hospital, EmergencyRequest } from '../types';
import MapComponent from '../components/Map';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Phone, Navigation } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  const [nearestAmbulance, setNearestAmbulance] = useState<{amb: Ambulance, dist: number} | null>(null);
  const [nearestHospital, setNearestHospital] = useState<{hosp: Hospital, dist: number} | null>(null);
  
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  
  const [form, setForm] = useState({
    emergency_type: 'Accident',
    description: '',
    condition: 'Stable' as any,
    conscious: true,
    breathing_normally: true,
    severe_injury: false,
    severe_bleeding: false,
    pregnancy_related: false,
    emergency_contact: 'Jane Doe',
    emergency_contact_phone: '555-9999'
  });

  useEffect(() => {
    // Check if there is an active request for this patient
    const requests = db.getRequests();
    const active = requests.find(r => r.patient_id === user?.id && r.status !== 'COMPLETED');
    if (active) {
      setActiveRequest(active);
      setLocation(active.location);
    }
  }, [user]);

  useEffect(() => {
    if (location) {
      // Find nearest available ambulance
      const ambulances = db.getAmbulances().filter(a => a.status === 'AVAILABLE');
      if (ambulances.length > 0) {
        const sorted = ambulances.map(a => ({
          amb: a,
          dist: calculateDistance(location.latitude, location.longitude, a.location.latitude, a.location.longitude)
        })).sort((a, b) => a.dist - b.dist);
        setNearestAmbulance(sorted[0]);
      } else {
        setNearestAmbulance(null);
      }

      // Find nearest hospital
      const hospitals = db.getHospitals();
      if (hospitals.length > 0) {
        const sortedH = hospitals.map(h => ({
          hosp: h,
          dist: calculateDistance(location.latitude, location.longitude, h.location.latitude, h.location.longitude)
        })).sort((a, b) => a.dist - b.dist);
        setNearestHospital(sortedH[0]);
      }
    }
  }, [location]);

  // Poll for updates if request is active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeRequest) {
      interval = setInterval(() => {
        const latest = db.getRequest(activeRequest.id);
        if (latest) setActiveRequest(latest);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRequest]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocationError('');
        },
        (err) => {
          setLocationError("Location access is unavailable. Please select your location manually on the map.");
          // Fallback to NYC center for demo purposes if blocked
          setLocation({ latitude: 40.7128, longitude: -74.0060 });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !user) return;

    const req = db.createRequest({
      patient_id: user.id,
      patient_name: user.name,
      age: 30, // Mock age
      ...form,
      location,
      status: 'PENDING',
      ambulance_id: nearestAmbulance?.amb.id
    });

    if (nearestAmbulance) {
      db.updateAmbulance(nearestAmbulance.amb.id, { status: 'ON_EMERGENCY' });
    }

    setActiveRequest(req);
  };

  if (activeRequest) {
    // Tracking View
    const amb = activeRequest.ambulance_id ? db.getAmbulances().find(a => a.id === activeRequest.ambulance_id) : null;
    const hosp = activeRequest.hospital_id ? db.getHospitals().find(h => h.id === activeRequest.hospital_id) : null;

    return (
      <div className="container">
        <h2 className="mb-4 text-center">Emergency Status</h2>
        <div className="grid grid-cols-1 gap-4" style={{ md: { gridTemplateColumns: '1fr 1fr' } }}>
          <div className="card">
            <h3 className="mb-3">Status Timeline</h3>
            <div className="timeline">
              <div className={`timeline-item ${['PENDING', 'ACCEPTED', 'GOING_TO_PATIENT', 'ARRIVED', 'PATIENT_ONBOARD', 'GOING_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL'].includes(activeRequest.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Emergency Requested</div>
                </div>
              </div>
              <div className={`timeline-item ${['ACCEPTED', 'GOING_TO_PATIENT', 'ARRIVED', 'PATIENT_ONBOARD', 'GOING_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL'].includes(activeRequest.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Ambulance Assigned</div>
                  {amb && <p className="text-sm text-muted">{amb.ambulance_number} is dispatched.</p>}
                </div>
              </div>
              <div className={`timeline-item ${['ARRIVED', 'PATIENT_ONBOARD', 'GOING_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL'].includes(activeRequest.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Ambulance Arrived</div>
                </div>
              </div>
              <div className={`timeline-item ${['GOING_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL'].includes(activeRequest.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Travelling to Hospital</div>
                  {hosp && <p className="text-sm text-muted">Heading to {hosp.name}</p>}
                </div>
              </div>
              <div className={`timeline-item ${['ARRIVED_AT_HOSPITAL'].includes(activeRequest.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Hospital Arrived</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               {amb && (
                 <a href={`tel:${amb.phone}`} className="btn btn-secondary w-full mb-2">
                   <Phone size={18} /> Call Ambulance ({amb.phone})
                 </a>
               )}
               {hosp && (
                 <a href={`tel:${hosp.phone}`} className="btn btn-secondary w-full">
                   <Phone size={18} /> Call Hospital ({hosp.phone})
                 </a>
               )}
               <button className="btn btn-secondary w-full mt-4 text-danger" onClick={() => {
                 db.updateRequest(activeRequest.id, { status: 'COMPLETED' });
                 setActiveRequest(null);
                 if (amb) db.updateAmbulance(amb.id, { status: 'AVAILABLE' });
               }}>
                 [Demo] End Emergency
               </button>
            </div>
          </div>
          <div>
            <MapComponent 
              center={location || { latitude: 40.7128, longitude: -74.0060 }}
              patientLocation={location!}
              ambulances={amb ? [amb] : []}
              hospitals={hosp ? [hosp] : (nearestHospital ? [nearestHospital.hosp] : [])}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {!location ? (
        <div className="card text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <AlertCircle size={48} className="text-danger mx-auto mb-4" />
          <h2 className="mb-4">Emergency Assistance</h2>
          <p className="mb-4">EmergencyLink provides coordination and location assistance. It does not replace official emergency services.</p>
          <button className="btn btn-danger sos" onClick={handleGetLocation}>
            🚨 Request Ambulance
          </button>
          {locationError && <p className="text-danger mt-3">{locationError}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" style={{ md: { gridTemplateColumns: '1fr 1fr' } }}>
          <div>
            <div className="card mb-4">
              <h3 className="mb-3">Emergency Request</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Emergency Type</label>
                  <select className="form-control" value={form.emergency_type} onChange={e => setForm({...form, emergency_type: e.target.value})}>
                    <option>Accident</option>
                    <option>Cardiac emergency</option>
                    <option>Breathing difficulty</option>
                    <option>Severe injury</option>
                    <option>Unconscious person</option>
                    <option>Stroke symptoms</option>
                    <option>Pregnancy-related emergency</option>
                    <option>Child emergency</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Condition</label>
                  <select className="form-control" value={form.condition} onChange={e => setForm({...form, condition: e.target.value as any})}>
                    <option>Stable</option>
                    <option>Serious</option>
                    <option>Critical</option>
                    <option>Unresponsive</option>
                  </select>
                  <small className="text-muted mt-1 display-block">These selections are user-reported information and are not a medical diagnosis.</small>
                </div>
                
                {['Serious', 'Critical', 'Unresponsive'].includes(form.condition) && (
                  <div className="alert alert-warning mt-2 mb-3">
                    <strong>Warning:</strong> For life-threatening emergencies, please contact official emergency services (911) immediately!
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.conscious} onChange={e => setForm({...form, conscious: e.target.checked})} /> Conscious?
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.breathing_normally} onChange={e => setForm({...form, breathing_normally: e.target.checked})} /> Breathing normally?
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.severe_injury} onChange={e => setForm({...form, severe_injury: e.target.checked})} /> Severe injury?
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.severe_bleeding} onChange={e => setForm({...form, severe_bleeding: e.target.checked})} /> Severe bleeding?
                  </label>
                </div>

                <button type="submit" className="btn btn-danger sos mt-4" disabled={!nearestAmbulance}>
                  SOS REQUEST AMBULANCE
                </button>
              </form>
            </div>
            
            {nearestAmbulance && (
              <div className="card mb-4" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                <h4 className="mb-2">Nearest Ambulance</h4>
                <p><strong>{nearestAmbulance.amb.ambulance_number}</strong></p>
                <p>Distance: {nearestAmbulance.dist} km (Route estimate based on available map data)</p>
                <p>Status: <span className="text-success">{nearestAmbulance.amb.status}</span></p>
              </div>
            )}

            {nearestHospital && (
              <div className="card mb-4">
                <h4 className="mb-2">Nearest Hospital (Geographic Distance)</h4>
                <p><strong>{nearestHospital.hosp.name}</strong></p>
                <p>Distance: {nearestHospital.dist} km</p>
                <p>Services: {nearestHospital.hosp.emergency_services.join(', ')}</p>
                <p>Status: {nearestHospital.hosp.status}</p>
              </div>
            )}
          </div>
          
          <div>
            <MapComponent 
              center={location}
              patientLocation={location}
              ambulances={db.getAmbulances()}
              hospitals={db.getHospitals()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
