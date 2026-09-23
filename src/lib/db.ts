import type { User, Ambulance, Hospital, EmergencyRequest } from '../types';

// Demo initial data
const DEMO_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital',
    address: '123 Medical Center Blvd',
    phone: '555-0101',
    location: { latitude: 40.7128, longitude: -74.0060 }, // Example: NYC
    emergency_services: ['Emergency Department', 'Trauma Care', 'Cardiology', 'ICU'],
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  },
  {
    id: 'h2',
    name: 'Westside Pediatric Care',
    address: '456 West Ave',
    phone: '555-0102',
    location: { latitude: 40.7200, longitude: -74.0100 },
    emergency_services: ['Emergency Department', 'Pediatrics', 'Pharmacy'],
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  },
  {
    id: 'h3',
    name: 'Mercy Trauma Center',
    address: '789 East St',
    phone: '555-0103',
    location: { latitude: 40.7050, longitude: -73.9900 },
    emergency_services: ['Emergency Department', 'Trauma Care', 'ICU', 'Neurology'],
    status: 'FULL',
    last_updated: new Date().toISOString()
  }
];

const DEMO_AMBULANCES: Ambulance[] = [
  {
    id: 'a1',
    ambulance_number: 'AMB-101',
    driver_id: 'd1',
    driver_name: 'John Smith',
    phone: '555-0201',
    location: { latitude: 40.7150, longitude: -74.0020 },
    status: 'AVAILABLE',
    hospital_affiliation: 'h1',
    last_updated: new Date().toISOString()
  },
  {
    id: 'a2',
    ambulance_number: 'AMB-102',
    driver_id: 'd2',
    driver_name: 'Sarah Johnson',
    phone: '555-0202',
    location: { latitude: 40.7080, longitude: -74.0120 },
    status: 'AVAILABLE',
    last_updated: new Date().toISOString()
  },
  {
    id: 'a3',
    ambulance_number: 'AMB-103',
    driver_id: 'd3',
    driver_name: 'Mike Davis',
    phone: '555-0203',
    location: { latitude: 40.7250, longitude: -73.9950 },
    status: 'BUSY',
    last_updated: new Date().toISOString()
  }
];

// LocalStorage Keys
const KEYS = {
  HOSPITALS: 'el_hospitals',
  AMBULANCES: 'el_ambulances',
  REQUESTS: 'el_requests',
  CURRENT_USER: 'el_current_user',
  TRAFFIC_WEATHER: 'el_env'
};

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(KEYS.HOSPITALS)) {
      localStorage.setItem(KEYS.HOSPITALS, JSON.stringify(DEMO_HOSPITALS));
    }
    if (!localStorage.getItem(KEYS.AMBULANCES)) {
      localStorage.setItem(KEYS.AMBULANCES, JSON.stringify(DEMO_AMBULANCES));
    }
    if (!localStorage.getItem(KEYS.REQUESTS)) {
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.TRAFFIC_WEATHER)) {
      localStorage.setItem(KEYS.TRAFFIC_WEATHER, JSON.stringify({ traffic: 'MODERATE', weather: 'Clear' }));
    }
  }

  reset() {
    localStorage.clear();
    this.init();
  }

  // Generic Getters/Setters
  private get<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Hospitals
  getHospitals(): Hospital[] {
    return this.get<Hospital>(KEYS.HOSPITALS);
  }

  updateHospital(id: string, data: Partial<Hospital>) {
    const list = this.getHospitals();
    const index = list.findIndex(h => h.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data, last_updated: new Date().toISOString() };
      this.set(KEYS.HOSPITALS, list);
      return list[index];
    }
    return null;
  }

  // Ambulances
  getAmbulances(): Ambulance[] {
    return this.get<Ambulance>(KEYS.AMBULANCES);
  }

  updateAmbulance(id: string, data: Partial<Ambulance>) {
    const list = this.getAmbulances();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data, last_updated: new Date().toISOString() };
      this.set(KEYS.AMBULANCES, list);
      return list[index];
    }
    return null;
  }

  // Emergency Requests
  getRequests(): EmergencyRequest[] {
    return this.get<EmergencyRequest>(KEYS.REQUESTS);
  }

  getRequest(id: string): EmergencyRequest | null {
    return this.getRequests().find(r => r.id === id) || null;
  }

  createRequest(request: Omit<EmergencyRequest, 'id' | 'created_at' | 'updated_at'>) {
    const list = this.getRequests();
    const newReq: EmergencyRequest = {
      ...request,
      id: 'req_' + Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newReq);
    this.set(KEYS.REQUESTS, list);
    return newReq;
  }

  updateRequest(id: string, data: Partial<EmergencyRequest>) {
    const list = this.getRequests();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data, updated_at: new Date().toISOString() };
      this.set(KEYS.REQUESTS, list);
      return list[index];
    }
    return null;
  }
  
  // Environment (Traffic/Weather)
  getEnvironment() {
    return JSON.parse(localStorage.getItem(KEYS.TRAFFIC_WEATHER) || '{}');
  }
  
  setEnvironment(data: { traffic?: string; weather?: string }) {
    const current = this.getEnvironment();
    localStorage.setItem(KEYS.TRAFFIC_WEATHER, JSON.stringify({ ...current, ...data }));
  }
}

export const db = new MockDatabase();

// Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
}
