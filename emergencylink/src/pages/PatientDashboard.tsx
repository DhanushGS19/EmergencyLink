import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Navigation, PhoneCall, ShieldAlert, HeartPulse, Activity } from 'lucide-react';
import Map from '../components/Map';

export default function PatientDashboard() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState({
    type: 'Accident',
    conscious: true,
    breathing: true
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const submitRequest = async () => {
    if (!location) {
        alert("Please enable location services.");
        return;
    }
    
    setRequestStatus('SEARCHING_FOR_AMBULANCE');
    setFormVisible(false);
    
    const { error } = await supabase
      .from('emergency_requests')
      .insert([{ 
          emergency_type: emergencyDetails.type, 
          priority: 'CRITICAL',
          condition_details: emergencyDetails,
          latitude: location.lat,
          longitude: location.lng,
          status: 'SEARCHING_FOR_AMBULANCE'
      }]);

    if (error) console.error("Error:", error);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 w-full absolute inset-0 z-0">
        <Map center={location} patientLocation={location} />
      </div>

      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)] z-10 transition-all duration-300 max-h-[85vh] overflow-y-auto">
        
        {/* State 1: Idle */}
        {!requestStatus && !formVisible && (
          <div className="p-6 pb-10 space-y-4">
            <h2 className="text-2xl font-bold text-center text-slate-900">Need Emergency Help?</h2>
            <button 
              onClick={() => setFormVisible(true)}
              className="w-full bg-emergency-red text-white py-6 rounded-2xl text-2xl font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
              <ShieldAlert size={36} />
              REQUEST AMBULANCE
            </button>
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-4 text-sm font-medium bg-slate-100 py-3 rounded-xl">
              <PhoneCall size={16} /> Or call 112 directly
            </div>
          </div>
        )}

        {/* State 2: Form */}
        {formVisible && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="text-emergency-red" /> Quick Details
              </h2>
              <button onClick={() => setFormVisible(false)} className="text-slate-500 font-bold">Cancel</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Type</label>
                <select 
                  className="w-full bg-slate-100 p-3 rounded-xl font-medium border-2 border-transparent focus:border-emergency-blue outline-none"
                  value={emergencyDetails.type}
                  onChange={e => setEmergencyDetails({...emergencyDetails, type: e.target.value})}
                >
                  <option>Accident</option>
                  <option>Cardiac Emergency</option>
                  <option>Breathing Difficulty</option>
                  <option>Severe Injury</option>
                  <option>Pregnancy</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex-1 flex items-center gap-3 bg-slate-100 p-3 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emergencyDetails.conscious} 
                    onChange={e => setEmergencyDetails({...emergencyDetails, conscious: e.target.checked})}
                    className="w-5 h-5 accent-emergency-red"
                  />
                  <span className="font-bold text-slate-700">Conscious</span>
                </label>
                <label className="flex-1 flex items-center gap-3 bg-slate-100 p-3 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emergencyDetails.breathing} 
                    onChange={e => setEmergencyDetails({...emergencyDetails, breathing: e.target.checked})}
                    className="w-5 h-5 accent-emergency-red"
                  />
                  <span className="font-bold text-slate-700">Breathing</span>
                </label>
              </div>

              <button 
                onClick={submitRequest}
                className="w-full bg-emergency-red text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 flex justify-center items-center gap-2 mt-4"
              >
                <Navigation size={20} />
                CONFIRM DISPATCH
              </button>
            </div>
          </div>
        )}

        {/* State 3: Searching/Active */}
        {requestStatus && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Emergency Status</h3>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold text-xs tracking-wider animate-pulse">
                {requestStatus.replace(/_/g, ' ')}
              </span>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-4">
               <Activity className="text-emergency-blue animate-spin" size={32} />
               <div>
                  <p className="font-bold text-slate-900">Coordinating response...</p>
                  <p className="text-sm text-slate-500 font-medium">Analyzing traffic, ETA, and availability</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
