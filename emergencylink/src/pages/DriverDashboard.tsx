import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Navigation, Check, X, MapPin, CloudRain, AlertTriangle } from 'lucide-react';
import Map from '../components/Map';
import { getLocalWeather } from '../lib/weather';
import type { WeatherData } from '../lib/weather';

export default function DriverDashboard() {
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [driverStatus, setDriverStatus] = useState('AVAILABLE');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  const ambulanceId = '123e4567-e89b-12d3-a456-426614174000'; // mock

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setDriverLocation(newLoc);
        
        if (!weather) {
            getLocalWeather(newLoc.lat, newLoc.lng).then(w => setWeather(w));
        }

        if (driverStatus === 'ON_EMERGENCY') {
          supabase.from('ambulances').update({ latitude: newLoc.lat, longitude: newLoc.lng }).eq('id', ambulanceId).then();
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    const subscription = supabase
      .channel('public:emergency_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_requests' }, payload => {
        if (driverStatus === 'AVAILABLE') setActiveRequest(payload.new);
      }).subscribe();

    return () => {
      navigator.geolocation.clearWatch(watchId);
      supabase.removeChannel(subscription);
    };
  }, [driverStatus, weather]);

  const acceptRequest = async () => {
    setDriverStatus('ON_EMERGENCY');
    const { error } = await supabase.from('emergency_requests').update({ status: 'AMBULANCE_EN_ROUTE', assigned_ambulance_id: ambulanceId }).eq('id', activeRequest.id);
    if (!error) setActiveRequest({ ...activeRequest, status: 'AMBULANCE_EN_ROUTE' });
  };

  return (
    <div className="h-full flex flex-col relative">
      <header className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg pointer-events-auto flex items-center gap-3 border border-white">
          <div className={`w-3 h-3 rounded-full ${driverStatus === 'AVAILABLE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-bold text-slate-800">{driverStatus.replace('_', ' ')}</span>
        </div>
        
        {weather && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg pointer-events-auto text-white flex items-center gap-3 border border-slate-700">
            <CloudRain size={20} className="text-blue-400" />
            <div>
              <p className="text-xs font-bold text-slate-400">Weather</p>
              <p className="text-sm font-bold">{weather.temp}°C, {weather.condition}</p>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 w-full z-0">
        <Map 
          center={driverLocation} 
          ambulanceLocation={driverLocation} 
          patientLocation={activeRequest ? {lat: activeRequest.latitude, lng: activeRequest.longitude} : null}
        />
      </div>

      {activeRequest && activeRequest.status === 'SEARCHING_FOR_AMBULANCE' && (
        <div className="absolute bottom-6 left-6 right-6 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-6 z-10 border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-100 p-4 rounded-2xl text-emergency-red">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">NEW EMERGENCY</h2>
              <p className="text-red-600 font-bold">{activeRequest.priority} Priority</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveRequest(null)} className="bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95">
              <X size={24} /> REJECT
            </button>
            <button onClick={acceptRequest} className="bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 shadow-green-600/30">
              <Check size={24} /> ACCEPT
            </button>
          </div>
        </div>
      )}

      {activeRequest && activeRequest.status === 'AMBULANCE_EN_ROUTE' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-10">
          <h2 className="text-xl font-bold mb-4 text-slate-900">En Route to Patient</h2>
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100">
             <div className="flex items-center gap-3">
               <div className="bg-blue-600 p-2 rounded-xl text-white">
                 <Navigation size={20} />
               </div>
               <div>
                 <p className="font-bold text-blue-900">Routing active</p>
                 <p className="text-sm text-blue-700 font-medium">Traffic conditions: Moderate</p>
               </div>
             </div>
          </div>
          <button className="w-full bg-emergency-blue text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95">
            MARK AS ARRIVED
          </button>
        </div>
      )}
    </div>
  );
}
