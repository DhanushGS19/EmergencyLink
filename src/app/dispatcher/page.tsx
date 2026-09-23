"use client";

import { useState, useEffect } from "react";
import DynamicMap from "@/components/DynamicMap";
import { getAllAmbulances, getAllEmergencies, getHospitals } from "../actions";

export default function DispatcherDashboard() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [traffic, setTraffic] = useState("LOW");
  const [weather, setWeather] = useState("Clear, Good Visibility");

  const loadData = () => {
    getAllAmbulances().then(setAmbulances);
    getAllEmergencies().then(setEmergencies);
    getHospitals().then(setHospitals);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const mapCenter: [number, number] = [40.7128, -74.0060];
  const markers = [
    ...ambulances.map(a => ({ 
      id: a.id, 
      type: "ambulance" as const, 
      position: [a.lat, a.lng] as [number, number], 
      title: `Ambulance ${a.vehicleNumber}`, 
      details: `Status: ${a.status} | Driver: ${a.driver?.name || "N/A"}` 
    })),
    ...hospitals.map(h => ({ 
      id: h.id, 
      type: "hospital" as const, 
      position: [h.lat, h.lng] as [number, number], 
      title: h.name, 
      details: h.emergencyServices 
    })),
    ...emergencies.filter(e => e.status !== "COMPLETED").map(e => ({
      id: e.id, 
      type: "patient" as const, 
      position: [e.lat, e.lng] as [number, number], 
      title: `Emergency: ${e.patientName}`, 
      details: e.condition 
    }))
  ];

  const activeEmergencies = emergencies.filter(e => e.status !== "COMPLETED");

  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col lg:flex-row p-4 lg:p-6 pb-8 pt-24 lg:pt-32">
        <div className="w-full lg:w-[420px] flex flex-col gap-4 pointer-events-auto h-full">
          
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Command Center</h2>
            <div className="flex gap-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-medical-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-medical-teal"></span>
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            
            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System Overrides</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Traffic</label>
                  <select className="bg-transparent w-full focus:outline-none text-white font-medium appearance-none" value={traffic} onChange={e => setTraffic(e.target.value)}>
                    <option value="LOW">Low Impact</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HEAVY">Heavy Congestion</option>
                  </select>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Weather</label>
                  <input className="bg-transparent w-full focus:outline-none text-white font-medium" value={weather} onChange={e => setWeather(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                <span>Active Emergencies</span>
                <span className="bg-emergency-red/20 text-emergency-red px-2 py-0.5 rounded-full text-[10px]">{activeEmergencies.length}</span>
              </h3>
              
              <div className="space-y-3">
                {activeEmergencies.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No active emergencies.</div>
                ) : (
                  activeEmergencies.map(e => (
                    <div key={e.id} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 transition-all hover:bg-slate-900/80">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-emergency-red text-sm">{e.emergencyType}</span>
                        <span className="bg-black/30 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider text-slate-300">{e.status.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-slate-200 text-sm font-medium mb-3">{e.patientName} ({e.patientAge}) - {e.condition}</p>
                      {e.ambulance ? (
                        <div className="flex items-center gap-2 bg-medical-blue/10 border border-medical-blue/20 p-2 rounded-xl">
                          <span className="text-medical-blue text-lg">🚑</span>
                          <span className="text-xs text-medical-blue font-bold uppercase tracking-widest">Unit {e.ambulance.vehicleNumber}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                          <span className="text-amber-500 text-lg">⚠️</span>
                          <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">Awaiting Assignment</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                <span>Ambulance Fleet</span>
                <span className="bg-medical-blue/20 text-medical-blue px-2 py-0.5 rounded-full text-[10px]">{ambulances.length}</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {ambulances.map(a => (
                  <div key={a.id} className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 ${a.status === "AVAILABLE" ? "bg-emerald-500/10 border-emerald-500/20" : a.status === "ON_EMERGENCY" ? "bg-emergency-red/10 border-emergency-red/20" : "bg-slate-900/50 border-white/5"}`}>
                    <div className="font-bold text-white text-sm">Unit {a.vehicleNumber}</div>
                    <div className={`text-[10px] uppercase tracking-widest font-bold ${a.status === "AVAILABLE" ? "text-emerald-400" : a.status === "ON_EMERGENCY" ? "text-emergency-red" : "text-slate-500"}`}>{a.status.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <DynamicMap
          center={mapCenter}
          zoom={12}
          markers={markers}
        />
      </div>
    </>
  );
}
