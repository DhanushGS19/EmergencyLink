# Supabase Database Setup

To make the application fully functional, execute this SQL script in your Supabase SQL Editor:

```sql
-- Create extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Tied to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('PATIENT', 'DRIVER', 'DISPATCHER', 'HOSPITAL', 'ADMIN')) NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Hospitals Table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  emergency_services JSONB
);

-- 3. Ambulances Table
CREATE TABLE ambulances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES profiles(id),
  plate_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('AVAILABLE', 'ON_EMERGENCY', 'BUSY', 'OFFLINE')) DEFAULT 'OFFLINE',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Emergency Requests Table
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  patient_name TEXT,
  patient_phone TEXT,
  emergency_type TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('CRITICAL', 'SERIOUS', 'URGENT', 'STANDARD')),
  condition_details JSONB,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT CHECK (status IN ('REQUESTED', 'SEARCHING_FOR_AMBULANCE', 'AMBULANCE_ASSIGNED', 'AMBULANCE_EN_ROUTE', 'AMBULANCE_ARRIVED', 'PATIENT_ONBOARD', 'EN_ROUTE_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL', 'COMPLETED', 'CANCELLED')) DEFAULT 'REQUESTED',
  assigned_ambulance_id UUID REFERENCES ambulances(id),
  recommended_hospital_id UUID REFERENCES hospitals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Realtime for live tracking and status updates
alter publication supabase_realtime add table ambulances;
alter publication supabase_realtime add table emergency_requests;
```
