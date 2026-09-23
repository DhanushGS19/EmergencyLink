"use client";

import { useState, useEffect } from "react";
import DynamicMap from "@/components/DynamicMap";
import { getUsersByRole, getDriverAmbulance, getPendingRequests, updateAmbulanceStatus, updateRequestStatus } from "../actions";

export default function DriverDashboard() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [ambulance, setAmbulance] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [liveLocation, setLiveLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    getUsersByRole("DRIVER").then(setDrivers);
  }, []);

  const loadDriverData = async (driverId: string) => {
    const amb = await getDriverAmbulance(driverId);
    setAmbulance(amb);
    if (amb) {
      if (amb.status === "AVAILABLE") {
        getPendingRequests().then(setPendingRequests);
      } else {
        setPendingRequests([]);
      }
    }
  };

  useEffect(() => {
    if (selectedDriverId) {
      loadDriverData(selectedDriverId);
      const interval = setInterval(() => loadDriverData(selectedDriverId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedDriverId]);

  // Simulate live location
  useEffect(() => {
    if (selectedDriverId && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          // In a real app, we would push this to the DB here so dispatcher sees it.
        },
        (error) => console.error(error)
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [selectedDriverId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ambulance) return;
    await updateAmbulanceStatus(ambulance.id, newStatus);
    loadDriverData(selectedDriverId);
  };

  const handleAcceptRequest = async (reqId: string) => {
    if (!ambulance) return;
    await updateRequestStatus(reqId, "ACCEPTED", ambulance.id);
    await updateAmbulanceStatus(ambulance.id, "ON_EMERGENCY");
    loadDriverData(selectedDriverId);
  };

  const handleAdvanceEmergency = async (reqId: string, currentStatus: string) => {
    const flow = [
      "REQUESTED", "ACCEPTED", "GOING_TO_PATIENT", "ARRIVED", 
      "PATIENT_ONBOARD", "GOING_TO_HOSPITAL", "ARRIVED_AT_HOSPITAL", "COMPLETED"
    ];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex > -1 && currentIndex < flow.length - 1) {
      const nextStatus = flow[currentIndex + 1];
      await updateRequestStatus(reqId, nextStatus);
      if (nextStatus === "COMPLETED") {
        await updateAmbulanceStatus(ambulance.id, "AVAILABLE");
      }
      loadDriverData(selectedDriverId);
    }
  };

  if (!selectedDriverId) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="glass-panel p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-medical-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-medical-blue">👨‍⚕️</span>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Driver Portal</h2>
          <select 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 text-white mb-4 appearance-none focus:outline-none focus:border-medical-blue transition-colors text-sm"
            onChange={(e) => setSelectedDriverId(e.target.value)}
          >
            <option value="">Select your profile...</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <DynamicMap center={[40.7128, -74.0060]} zoom={12} markers={[]} />
        </div>
      </div>
    );
  }

  if (!ambulance) {
    return <div className="p-8 text-center mt-20">No ambulance assigned to this driver.</div>;
  }

  const activeRequest = ambulance.requests?.[0]; // Assume 1 active at a time

  const mapCenter: [number, number] = liveLocation ? [liveLocation.lat, liveLocation.lng] : [ambulance.lat, ambulance.lng];
  const markers = [
    { id: "amb", type: "ambulance" as const, position: mapCenter, title: "You", details: ambulance.status },
    ...(activeRequest ? [{ id: "pat", type: "patient" as const, position: [activeRequest.lat, activeRequest.lng] as [number, number], title: activeRequest.patientName, details: activeRequest.condition }] : [])
  ];

  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col lg:flex-row p-4 lg:p-6 pb-8 pt-24 lg:pt-32">
        <div className="w-full lg:w-[400px] flex flex-col gap-4 pointer-events-auto">
          
          {/* Driver Status Panel */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🚑</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white leading-tight">{ambulance.vehicleNumber}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${ambulance.status === "AVAILABLE" ? "bg-emerald-500" : ambulance.status === "ON_EMERGENCY" ? "bg-emergency-red animate-pulse" : "bg-slate-500"}`}></span>
                  <p className="text-[10px] text-slate-300 uppercase tracking-widest">{ambulance.status.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button onClick={() => handleStatusChange("AVAILABLE")} disabled={ambulance.status === "ON_EMERGENCY"} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ambulance.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                Available
              </button>
              <button onClick={() => handleStatusChange("OFFLINE")} disabled={ambulance.status === "ON_EMERGENCY"} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ambulance.status === "OFFLINE" ? "bg-slate-700 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                Offline
              </button>
            </div>
          </div>

          <div className="pl-2">
            {liveLocation ? (
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> GPS Active
              </p>
            ) : (
              <p className="text-[10px] text-amber-400 uppercase tracking-widest">GPS Unavailable</p>
            )}
          </div>

          {!activeRequest && ambulance.status === "AVAILABLE" && (
            <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl mt-2">
              <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-4">Pending Dispatches</h3>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">Waiting for incoming requests...</div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 transition-all hover:bg-slate-900/80">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-emergency-red text-sm uppercase tracking-wide">{req.emergencyType}</span>
                        <span className="text-[10px] text-slate-400 bg-black/30 px-2 py-1 rounded">{req.condition}</span>
                      </div>
                      <p className="text-sm text-slate-200 mb-4">{req.patientName}, {req.patientAge} yrs</p>
                      <button onClick={() => handleAcceptRequest(req.id)} className="w-full bg-medical-blue hover:bg-medical-blue-hover text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        Accept Dispatch
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeRequest && (
            <div className="glass-panel rounded-3xl p-6 border border-emergency-red/30 shadow-[0_0_30px_rgba(225,29,72,0.15)] mt-2 animate-in fade-in slide-in-from-left-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emergency-red rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-sm text-emergency-red uppercase tracking-widest">Active Dispatch</h3>
                </div>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                  {activeRequest.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-400">Patient</div>
                  <div className="text-white text-right font-medium">{activeRequest.patientName} ({activeRequest.patientAge})</div>
                  
                  <div className="text-slate-400">Type</div>
                  <div className="text-white text-right font-medium">{activeRequest.emergencyType}</div>
                  
                  <div className="text-slate-400">Condition</div>
                  <div className="text-white text-right font-medium">{activeRequest.condition}</div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed">"{activeRequest.description}"</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleAdvanceEmergency(activeRequest.id, activeRequest.status)}
                  className="w-full bg-medical-blue hover:bg-medical-blue-hover transition-all transform active:scale-95 py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-white shadow-lg"
                >
                  {
                    activeRequest.status === "ACCEPTED" ? "Going to Patient" :
                    activeRequest.status === "GOING_TO_PATIENT" ? "Mark Arrived" :
                    activeRequest.status === "ARRIVED" ? "Patient Onboard" :
                    activeRequest.status === "PATIENT_ONBOARD" ? "Going to Hospital" :
                    activeRequest.status === "GOING_TO_HOSPITAL" ? "Arrived at Hospital" :
                    activeRequest.status === "ARRIVED_AT_HOSPITAL" ? "Complete Emergency" : ""
                  }
                </button>
                
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeRequest.lat},${activeRequest.lng}`}
                  target="_blank" rel="noreferrer"
                  className="w-full bg-white/5 hover:bg-white/10 text-center py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors"
                >
                  External Navigation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <DynamicMap center={mapCenter} zoom={14} markers={markers} />
      </div>
    </>
  );
}
