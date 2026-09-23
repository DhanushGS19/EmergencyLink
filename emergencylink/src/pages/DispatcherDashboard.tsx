import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Users, Truck, Activity } from 'lucide-react';
import Map from '../components/Map';

export default function DispatcherDashboard() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: emData } = await supabase.from('emergency_requests').select('*').neq('status', 'COMPLETED');
      const { data: ambData } = await supabase.from('ambulances').select('*');
      if (emData) setEmergencies(emData);
      if (ambData) setAmbulances(ambData);
    };
    fetchData();

    const emSub = supabase.channel('emergencies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, () => fetchData())
      .subscribe();

    const ambSub = supabase.channel('ambulances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(emSub); supabase.removeChannel(ambSub); };
  }, []);

  return (
    <div className="flex h-full bg-slate-50">
      <aside className="w-80 bg-slate-900 text-white flex flex-col h-full z-10 shadow-2xl">
        <div className="p-6 bg-slate-950 flex items-center gap-3 border-b border-slate-800">
          <ShieldAlert className="text-emergency-red" size={28} />
          <h1 className="text-xl font-bold tracking-wide">Command Center</h1>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider">Active Incidents</h2>
          <div className="space-y-3">
            {emergencies.map(em => (
              <div key={em.id} className="bg-slate-800 p-4 rounded-2xl border-l-4 border-red-500 cursor-pointer hover:bg-slate-700 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{em.priority}</span>
                  <span className="text-[10px] bg-slate-950 text-slate-300 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {em.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">Type: {em.emergency_type}</p>
              </div>
            ))}
            {emergencies.length === 0 && <p className="text-slate-500 text-sm font-medium">No active emergencies.</p>}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full">
        <header className="absolute top-4 left-4 z-10 flex gap-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur border border-white text-red-700 px-5 py-3 rounded-2xl shadow-lg">
            <Activity />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Active Cases</p>
              <p className="text-2xl font-black leading-none">{emergencies.length}</p>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur border border-white text-green-700 px-5 py-3 rounded-2xl shadow-lg">
            <Truck />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-500">Available Units</p>
              <p className="text-2xl font-black leading-none">{ambulances.filter(a => a.status === 'AVAILABLE').length}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 w-full relative z-0">
          <Map center={{lat: 28.6139, lng: 77.2090}} />
        </div>
      </main>
    </div>
  );
}
