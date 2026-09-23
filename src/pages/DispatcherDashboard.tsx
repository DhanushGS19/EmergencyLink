import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { Ambulance, EmergencyRequest, Hospital } from '../types';
import MapComponent from '../components/Map';
import { Radio } from 'lucide-react';

const DispatcherDashboard = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [env, setEnv] = useState<{traffic?: string, weather?: string}>({});

  const [trafficInput, setTrafficInput] = useState('');
  const [weatherInput, setWeatherInput] = useState('');

  const refreshData = () => {
    setAmbulances(db.getAmbulances());
    setHospitals(db.getHospitals());
    setRequests(db.getRequests().filter(r => r.status !== 'COMPLETED'));
    
    const currEnv = db.getEnvironment();
    setEnv(currEnv);
    setTrafficInput(currEnv.traffic || 'MODERATE');
    setWeatherInput(currEnv.weather || 'Clear');
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateEnv = (e: React.FormEvent) => {
    e.preventDefault();
    db.setEnvironment({ traffic: trafficInput, weather: weatherInput });
    refreshData();
    alert('Environment conditions updated manually.');
  };

  const assignAmbulance = (reqId: string, ambId: string) => {
    db.updateRequest(reqId, { ambulance_id: ambId, status: 'ACCEPTED' });
    db.updateAmbulance(ambId, { status: 'ON_EMERGENCY' });
    refreshData();
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h2><Radio className="inline-block mr-2" /> Dispatch Command Center</h2>
        <div className="text-muted">
          Active Emergencies: {requests.length} | 
          Available Ambulances: {ambulances.filter(a => a.status === 'AVAILABLE').length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4" style={{ md: { gridTemplateColumns: '1fr 2fr' } }}>
        <div className="flex-col gap-4">
          <div className="card">
            <h3 className="mb-3">Active Emergencies</h3>
            {requests.length === 0 ? (
              <p className="text-muted">No active emergency requests.</p>
            ) : (
              <div className="flex-col gap-3">
                {requests.map(req => (
                  <div key={req.id} className="p-3 bg-opacity-10 rounded border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex justify-between mb-1">
                      <strong>{req.patient_name}</strong>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{req.status}</span>
                    </div>
                    <p className="text-sm text-muted mb-2">{req.emergency_type} - {req.condition}</p>
                    
                    {!req.ambulance_id && (
                      <div>
                        <select 
                          className="form-control mb-2 form-control-sm"
                          onChange={(e) => assignAmbulance(req.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign Ambulance...</option>
                          {ambulances.filter(a => a.status === 'AVAILABLE').map(a => (
                            <option key={a.id} value={a.id}>{a.ambulance_number} ({a.driver_name})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {req.ambulance_id && (
                      <p className="text-sm">Assigned: {ambulances.find(a => a.id === req.ambulance_id)?.ambulance_number}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3">Manual Conditions</h3>
            <div className="alert alert-info" style={{ fontSize: '0.875rem' }}>
              Real-time traffic unavailable in API-free mode. Manually updated by dispatcher.
            </div>
            <form onSubmit={updateEnv}>
              <div className="form-group mb-2">
                <label className="form-label">Traffic Status</label>
                <select className="form-control" value={trafficInput} onChange={e => setTrafficInput(e.target.value)}>
                  <option>LOW</option>
                  <option>MODERATE</option>
                  <option>HEAVY</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Weather Conditions</label>
                <input type="text" className="form-control" value={weatherInput} onChange={e => setWeatherInput(e.target.value)} placeholder="e.g. Heavy Rain, Low Visibility" />
              </div>
              <button type="submit" className="btn btn-secondary w-full">Update Conditions</button>
            </form>
          </div>
        </div>

        <div>
           <MapComponent 
             center={{ latitude: 40.7128, longitude: -74.0060 }}
             ambulances={ambulances}
             hospitals={hospitals}
             className="map-container-large"
           />
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
