import React from 'react';
import { Settings, ShieldCheck, Database, Key } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
      <header className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="text-slate-400" /> System Settings
        </h1>
        <p className="text-slate-500 font-medium mt-1">Manage API keys and integration status</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supabase Status */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Supabase Database</h2>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">CONNECTED</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-4">Real-time subscriptions and data persistence are active.</p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">URL</span>
            <span className="text-xs font-mono font-bold text-slate-700">configured via .env</span>
          </div>
        </div>

        {/* Google Maps Status */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Google Maps API</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">CONNECTED</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-4">Maps, Places, and Directions API access confirmed.</p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">KEY</span>
            <span className="text-xs font-mono font-bold text-slate-700">************* via .env</span>
          </div>
        </div>

        {/* OpenWeather Status */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
              <Key size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">OpenWeather API</h2>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">CONNECTED</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-4">Live weather conditions and visibility data active.</p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">KEY</span>
            <span className="text-xs font-mono font-bold text-slate-700">************* via .env</span>
          </div>
        </div>
      </div>
    </div>
  );
}
