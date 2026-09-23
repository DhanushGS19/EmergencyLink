export type Role = 'PATIENT' | 'DRIVER' | 'DISPATCHER' | 'HOSPITAL' | 'ADMIN';

export type AmbulanceStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_EMERGENCY';
export type EmergencyStatus = 'PENDING' | 'ACCEPTED' | 'GOING_TO_PATIENT' | 'ARRIVED' | 'PATIENT_ONBOARD' | 'GOING_TO_HOSPITAL' | 'ARRIVED_AT_HOSPITAL' | 'COMPLETED';
export type HospitalStatus = 'AVAILABLE' | 'FULL' | 'UNAVAILABLE';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  phone?: string;
}

export interface Ambulance {
  id: string;
  ambulance_number: string;
  driver_id: string;
  driver_name: string;
  phone: string;
  location: Location;
  status: AmbulanceStatus;
  hospital_affiliation?: string;
  last_updated: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: Location;
  emergency_services: string[];
  status: HospitalStatus;
  last_updated: string;
}

export interface EmergencyRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  age: number;
  emergency_type: string;
  description: string;
  condition: 'Stable' | 'Serious' | 'Critical' | 'Unresponsive';
  conscious: boolean;
  breathing_normally: boolean;
  severe_injury: boolean;
  severe_bleeding: boolean;
  pregnancy_related: boolean;
  emergency_contact: string;
  emergency_contact_phone: string;
  location: Location;
  status: EmergencyStatus;
  ambulance_id?: string;
  hospital_id?: string;
  created_at: string;
  updated_at: string;
}
