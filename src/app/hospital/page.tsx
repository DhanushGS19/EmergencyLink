"use client";

import { useState, useEffect } from "react";
import { getHospitals, getAllEmergencies } from "../actions";
import DynamicMap from "@/components/DynamicMap";

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [emergencies, setEmergencies] = useState<any[]>([]);

  const loadData = () => {
    getHospitals().then(setHospitals);
    getAllEmergencies().then(setEmergencies);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!selectedHospitalId) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
        <div className="glass-panel p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl border-medical-teal/30">
          <div className="w-16 h-16 bg-medical-teal/20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-3xl text-medical-teal font-black">H</span>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Facility Portal</h2>
          <select 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 text-white mb-4 appearance-none focus:outline-none focus:border-medical-teal transition-colors text-sm"
            onChange={(e) => setSelectedHospitalId(e.target.value)}
          >
            <option value="">Select facility...</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const hospital = hospitals.find(h => h.id === selectedHospitalId);
  if (!hospital) return null;

  const incomingPatients = emergencies.filter(e => 
    e.hospitalId === selectedHospitalId && 
    (e.status === "GOING_TO_HOSPITAL" || e.status === "ARRIVED_AT_HOSPITAL")
  );

  const mapCenter: [number, number] = [hospital.lat, hospital.lng];
  const markers = [
    { id: hospital.id, type: "hospital" as const, position: mapCenter, title: hospital.name, details: hospital.emergencyServices },
    ...incomingPatients.map(e => ({
      id: e.id, 
      type: "ambulance" as const, 
      position: [e.lat, e.lng] as [number, number], // We are using emergency location as proxy for ambulance since we aren't storing live ambulance lat/lng in DB for demo
      title: `Incoming: ${e.patientName}`, 
      details: `Unit ${e.ambulance?.vehicleNumber}`
    }))
  ];

  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col p-4 lg:p-6 pb-8 pt-24 lg:pt-32">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 pointer-events-auto h-full">
          
          <div className="glass-panel p-8 rounded-3xl mb-4 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-20 text-[200px] text-white/[0.02] font-black pointer-events-none rotate-12">H</div>
            
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{hospital.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">{hospital.emergencyServices}</span>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center min-w-[150px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Facility Status</p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold inline-block shadow-lg ${hospital.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10" : "bg-emergency-red/20 text-emergency-red border border-emergency-red/30 shadow-emergency-red/10"}`}>
                {hospital.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emergency-red/10 rounded-full flex items-center justify-center border border-emergency-red/20 glass-panel">
              <span className="text-xl">🚑</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Incoming Inbound ({incomingPatients.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-8 pr-2">
            {incomingPatients.length === 0 ? (
              <div className="col-span-full text-center p-16 glass-panel rounded-3xl border border-dashed border-white/10">
                <span className="text-4xl block mb-4 opacity-50">☕</span>
                <p className="text-slate-400 font-medium tracking-wide">No inbound emergency transports at this time.</p>
              </div>
            ) : (
              incomingPatients.map(req => (
                <div key={req.id} className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-bold text-lg text-emergency-red tracking-tight mb-1">{req.emergencyType}</h4>
                      <span className="text-xs text-slate-400 bg-black/20 px-2 py-1 rounded-full uppercase tracking-wider">{req.condition}</span>
                    </div>
                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                      <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Patient</span>
                      <span className="text-white font-medium text-sm">{req.patientName} ({req.patientAge}y)</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                      <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Transport</span>
                      <span className="text-medical-teal font-bold text-sm">Unit {req.ambulance?.vehicleNumber}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <DynamicMap center={mapCenter} zoom={14} markers={markers} />
      </div>
    </>
  );
}
