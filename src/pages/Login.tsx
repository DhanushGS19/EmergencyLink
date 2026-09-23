import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';
import { Shield, User, Truck, Radio, Hospital as HospitalIcon } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/');
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
      <div className="card text-center">
        <h2 className="mb-2">EmergencyLink Login</h2>
        <p className="mb-4">Select a demo role to continue</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-secondary flex-col" style={{ padding: '2rem' }} onClick={() => handleLogin('PATIENT')}>
            <User size={32} className="mb-2 text-primary" />
            Patient
          </button>
          
          <button className="btn btn-secondary flex-col" style={{ padding: '2rem' }} onClick={() => handleLogin('DRIVER')}>
            <Truck size={32} className="mb-2 text-primary" />
            Ambulance Driver
          </button>
          
          <button className="btn btn-secondary flex-col" style={{ padding: '2rem' }} onClick={() => handleLogin('DISPATCHER')}>
            <Radio size={32} className="mb-2 text-primary" />
            Dispatcher
          </button>
          
          <button className="btn btn-secondary flex-col" style={{ padding: '2rem' }} onClick={() => handleLogin('HOSPITAL')}>
            <HospitalIcon size={32} className="mb-2 text-primary" />
            Hospital Admin
          </button>
        </div>
        
        <div className="mt-3">
          <button className="btn btn-secondary w-full" style={{ padding: '1rem' }} onClick={() => handleLogin('ADMIN')}>
            <Shield size={24} className="mr-2 text-danger" />
            System Admin
          </button>
        </div>

        <div className="mt-4 alert alert-warning" style={{ fontSize: '0.875rem', textAlign: 'left' }}>
          <strong>DEMO MODE:</strong> This is a local prototype using browser storage. No real API keys or external services are connected.
        </div>
      </div>
    </div>
  );
};

export default Login;
