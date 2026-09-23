"use client";

import { useState, useEffect } from "react";
import { getHospitals, getAllAmbulances, getUsersByRole } from "../actions";

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    getHospitals().then(setHospitals);
    getAllAmbulances().then(setAmbulances);
    getUsersByRole("DRIVER").then(setDrivers);
  }, []);

  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-y-auto pt-32 pb-12 px-4 lg:px-12 z-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">System Administration</h2>
            <p className="text-slate-400 font-medium">Manage demo data, vehicles, facilities, and user accounts.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5 text-xs text-slate-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            System Online
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hospitals Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <span className="text-medical-teal">🏥</span> Facilities
                <span className="bg-medical-teal/20 text-medical-teal px-2 py-0.5 rounded-full text-[10px] ml-2">{hospitals.length}</span>
              </h3>
              <button className="text-xs bg-medical-blue hover:bg-medical-blue-hover transition-colors px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-white shadow-lg">Add New</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-bold">Name</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {hospitals.map(h => (
                    <tr key={h.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 font-medium text-slate-200">{h.name}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${h.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-500 group-hover:text-medical-blue transition-colors text-xs font-bold uppercase tracking-widest">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ambulances Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <span className="text-emergency-red">🚑</span> Fleet
                <span className="bg-emergency-red/20 text-emergency-red px-2 py-0.5 rounded-full text-[10px] ml-2">{ambulances.length}</span>
              </h3>
              <button className="text-xs bg-medical-blue hover:bg-medical-blue-hover transition-colors px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-white shadow-lg">Add New</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-bold">Vehicle #</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Driver</th>
                    <th className="px-5 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ambulances.map(a => (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 font-bold text-slate-200">{a.vehicleNumber}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${a.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-400" : a.status === "ON_EMERGENCY" ? "bg-emergency-red/10 text-emergency-red" : "bg-slate-800 text-slate-400"}`}>
                          {a.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-medium">{a.driver?.name || 'Unassigned'}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-500 group-hover:text-medical-blue transition-colors text-xs font-bold uppercase tracking-widest">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col lg:col-span-2">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <span className="text-medical-blue">👨‍⚕️</span> Personnel
                <span className="bg-medical-blue/20 text-medical-blue px-2 py-0.5 rounded-full text-[10px] ml-2">{drivers.length}</span>
              </h3>
              <button className="text-xs bg-medical-blue hover:bg-medical-blue-hover transition-colors px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-white shadow-lg">Add New</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-bold">Name</th>
                    <th className="px-5 py-3 font-bold">Role</th>
                    <th className="px-5 py-3 font-bold">Onboarded</th>
                    <th className="px-5 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {drivers.map(d => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 font-medium text-slate-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-white/5">{d.name.charAt(0)}</div>
                        {d.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-full uppercase tracking-wider font-bold border border-white/5">
                          {d.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-500 group-hover:text-medical-blue transition-colors text-xs font-bold uppercase tracking-widest">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
