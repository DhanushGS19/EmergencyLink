import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AlertCircle, Truck, ShieldAlert, Activity, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Patient', icon: AlertCircle },
    { path: '/driver', label: 'Driver', icon: Truck },
    { path: '/dispatch', label: 'Dispatch', icon: ShieldAlert },
    { path: '/hospital', label: 'Hospital', icon: Activity },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-emergency-red" size={28} />
          <span className="text-xl font-bold tracking-wide">EmergencyLink</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${
                  isActive ? 'bg-emergency-blue text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
