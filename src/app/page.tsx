"use client";

import { useState, useEffect } from "react";
import DynamicMap from "@/components/DynamicMap";
import { getAvailableAmbulances, getHospitals, submitEmergencyRequest } from "./actions";
import { calculateHaversineDistance } from "@/lib/utils";

type Location = { lat: number; lng: number };
type Ambulance = Awaited<ReturnType<typeof getAvailableAmbulances>>[0] & { distance?: number };
type Hospital = Awaited<ReturnType<typeof getHospitals>>[0] & { distance?: number };

export default function PatientDashboard() {
  const [location, setLocation] = useState<Location | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    emergencyType: "Accident",
    description: "",
    condition: "Stable",
    contactName: "",
    contactPhone: "",
  });

  useEffect(() => {
    // Initial fetch to show map markers even before user location
    Promise.all([getAvailableAmbulances(), getHospitals()]).then(([ambs, hosps]) => {
      setAmbulances(ambs);
      setHospitals(hosps);
    });
  }, []);

  const requestLocation = () => {
    setLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          setLoadingLocation(false);
          setShowForm(true);
          updateDistances(loc);
        },
        (error) => {
          console.error("Location error", error);
          alert("Location access is unavailable. Please select your location manually on the map by clicking.");
          setLoadingLocation(false);
          setLocation({ lat: 40.7128, lng: -74.0060 }); // Default to NYC for demo
          setShowForm(true);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (showForm) {
      const loc = { lat, lng };
      setLocation(loc);
      updateDistances(loc);
    }
  };

  const updateDistances = (loc: Location) => {
    setAmbulances((prev) =>
      prev
        .map((a) => ({ ...a, distance: calculateHaversineDistance(loc.lat, loc.lng, a.lat, a.lng) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    );
    setHospitals((prev) =>
      prev
        .map((h) => ({ ...h, distance: calculateHaversineDistance(loc.lat, loc.lng, h.lat, h.lng) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return alert("Location is required.");
    
    setFormLoading(true);
    try {
      await submitEmergencyRequest({
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge) || 0,
        emergencyType: formData.emergencyType,
        description: formData.description,
        condition: formData.condition,
        lat: location.lat,
        lng: location.lng,
      });
      setSuccess(true);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  };

  const mapCenter: [number, number] = location ? [location.lat, location.lng] : [40.7128, -74.0060];
  const markers = [
    ...(location ? [{ id: "patient", type: "patient" as const, position: [location.lat, location.lng] as [number, number], title: "Your Location" }] : []),
    ...ambulances.map((a) => ({ id: a.id, type: "ambulance" as const, position: [a.lat, a.lng] as [number, number], title: `Ambulance ${a.vehicleNumber}`, details: `Status: ${a.status}` })),
    ...hospitals.map((h) => ({ id: h.id, type: "hospital" as const, position: [h.lat, h.lng] as [number, number], title: h.name, details: h.emergencyServices }))
  ];

  if (success) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border-emerald-500/30">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Request Sent</h2>
          <p className="text-slate-300 mb-8">Your request has been dispatched. The nearest available ambulance is being assigned.</p>
          <div className="bg-slate-900/50 p-5 rounded-2xl text-left mb-8 border border-white/5">
            <h3 className="font-bold text-emerald-400 mb-3 uppercase tracking-wider text-sm">Immediate Actions</h3>
            <ul className="text-sm text-slate-300 space-y-3">
              <li className="flex gap-2"><span>1.</span> Stay calm and remain at your location.</li>
              <li className="flex gap-2"><span>2.</span> Keep your phone nearby. The driver will contact you.</li>
              <li className="flex gap-2"><span>3.</span> If the situation is life-threatening, dial official emergency services immediately.</li>
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-700 hover:bg-slate-600 transition-colors text-white py-4 rounded-xl font-bold tracking-wide">
            Return to Dashboard
          </button>
        </div>
        {/* Render Map in background for aesthetics even on success */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <DynamicMap center={mapCenter} zoom={12} markers={markers} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Panel Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end lg:justify-center p-4 lg:p-12 pb-8">
        <div className="w-full max-w-lg mx-auto lg:ml-0 lg:mr-auto pointer-events-auto mt-24 lg:mt-32">
          
          {!showForm ? (
            <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/10 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center">
                <div className="inline-block bg-emergency-red/20 text-emergency-red font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4">
                  Emergency Assistance
                </div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Need Help?</h2>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Request a medical transport immediately. Your location will be shared with the nearest unit.</p>
              </div>
              
              <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-pulse-ring"></div>
                <button
                  onClick={requestLocation}
                  disabled={loadingLocation}
                  className="w-full h-full bg-emergency-red hover:bg-emergency-hover transition-colors rounded-full shadow-[0_0_40px_rgba(225,29,72,0.5)] flex flex-col items-center justify-center gap-2 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 z-10"
                >
                  <span className="text-5xl mb-2">✚</span>
                  <span className="text-xl font-black tracking-widest uppercase">
                    {loadingLocation ? "Locating..." : "SOS"}
                  </span>
                </button>
              </div>
              
              <p className="text-[10px] text-slate-500 text-center max-w-[250px] uppercase tracking-wider">
                Does not replace official emergency services.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-8 duration-500 max-h-[75vh] overflow-y-auto">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl tracking-tight text-white">Emergency Request</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors text-sm">Cancel</button>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-medical-teal">📍</span>
                  <h4 className="font-semibold text-sm text-slate-200">Location Verified</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">If incorrect, tap the map to adjust the pin.</p>
                
                {ambulances.length > 0 && ambulances[0].distance !== undefined && (
                  <div className="bg-medical-blue/10 border border-medical-blue/20 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-medical-blue uppercase tracking-widest font-bold block mb-1">Nearest Unit</span>
                      <span className="font-bold text-white text-sm">Unit {ambulances[0].vehicleNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-light text-white">{ambulances[0].distance}</span>
                      <span className="text-xs text-slate-400 ml-1">km</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Patient Name" className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-medical-blue transition-colors text-sm" value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
                  <input required type="number" placeholder="Age" className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-medical-blue transition-colors text-sm" value={formData.patientAge} onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })} />
                </div>
                
                <select className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 w-full text-white focus:outline-none focus:border-medical-blue transition-colors text-sm appearance-none" value={formData.emergencyType} onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}>
                  <option value="Accident">Accident</option>
                  <option value="Cardiac emergency">Cardiac emergency</option>
                  <option value="Breathing difficulty">Breathing difficulty</option>
                  <option value="Severe injury">Severe injury</option>
                  <option value="Unconscious person">Unconscious person</option>
                  <option value="Stroke symptoms">Stroke symptoms</option>
                  <option value="Pregnancy-related emergency">Pregnancy-related emergency</option>
                  <option value="Child emergency">Child emergency</option>
                  <option value="Other">Other</option>
                </select>

                <select className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 w-full text-white focus:outline-none focus:border-medical-blue transition-colors text-sm appearance-none" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })}>
                  <option value="Stable">Condition: Stable</option>
                  <option value="Serious">Condition: Serious</option>
                  <option value="Critical">Condition: Critical</option>
                  <option value="Unresponsive">Condition: Unresponsive</option>
                </select>
                
                <textarea placeholder="Brief description of the situation..." rows={3} className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 w-full text-white placeholder-slate-500 focus:outline-none focus:border-medical-blue transition-colors text-sm resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>

              <button type="submit" disabled={formLoading} className="w-full bg-medical-blue hover:bg-medical-blue-hover transition-colors text-white rounded-xl py-4 text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-2 disabled:opacity-50">
                {formLoading ? "Submitting..." : "Confirm Dispatch Request"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Base Map Layer */}
      <div className="absolute inset-0 z-0">
        <DynamicMap center={mapCenter} zoom={13} markers={markers} onClick={handleMapClick} />
      </div>
    </>
  );
}
