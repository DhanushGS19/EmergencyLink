import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Clock, CheckCircle } from 'lucide-react';

export default function HospitalDashboard() {
  const [incomingPatients, setIncomingPatients] = useState<any[]>([]);
  const hospitalId = 'your-hospital-uuid-here'; 

  useEffect(() => {
    const fetchIncoming = async () => {
      const { data } = await supabase
        .from('emergency_requests')
        .select(`*, ambulances(plate_number)`)
        .eq('recommended_hospital_id', hospitalId)
        .in('status', ['EN_ROUTE_TO_HOSPITAL', 'PATIENT_ONBOARD']);
      
      if (data) setIncomingPatients(data);
    };

    fetchIncoming();

    const sub = supabase.channel('hospital_incoming')
      .on('postgres_changes', { 
        event: '*', schema: 'public', table: 'emergency_requests',
        filter: `recommended_hospital_id=eq.${hospitalId}`
      }, () => fetchIncoming()).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">City General Hospital</h1>
          <p className="text-slate-500 font-medium">Emergency Department Live Feed</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-full font-bold border border-green-100">
          <CheckCircle size={20} /> Accepting Patients
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomingPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emergency-red animate-pulse" />
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-black text-emergency-red">INBOUND {patient.priority}</h2>
              <div className="bg-red-50 p-2 rounded-xl text-red-500">
                <Activity size={24} />
              </div>
            </div>
            
            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-slate-600 font-medium flex justify-between">
                <span>Type</span> 
                <span className="font-bold text-slate-900">{patient.emergency_type}</span>
              </p>
              <p className="text-slate-600 font-medium flex justify-between">
                <span>Unit</span> 
                <span className="font-bold text-slate-900">{patient.ambulances?.plate_number || 'Unknown'}</span>
              </p>
              <p className="text-slate-600 font-medium flex justify-between">
                <span>Status</span> 
                <span className="font-bold text-slate-900">{patient.condition_details?.conscious ? 'Conscious' : 'Unconscious'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-orange-700 bg-orange-50 p-4 rounded-2xl font-bold border border-orange-100">
              <Clock size={24} className="animate-pulse" /> ETA: ~8 Minutes
            </div>
          </div>
        ))}
        {incomingPatients.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400 flex flex-col items-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Activity size={48} className="opacity-50" />
            </div>
            <p className="text-xl font-bold text-slate-500">No incoming emergencies</p>
            <p className="text-sm font-medium mt-1">Standby for dispatch assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
