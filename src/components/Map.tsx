import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Location, Ambulance, Hospital } from '../types';
import L from 'leaflet';

interface MapProps {
  center: Location;
  patientLocation?: Location;
  ambulances?: Ambulance[];
  hospitals?: Hospital[];
  onAmbulanceClick?: (a: Ambulance) => void;
  onHospitalClick?: (h: Hospital) => void;
  className?: string;
}

// Custom icons
const patientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }: { center: Location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);
  return null;
};

const MapComponent: React.FC<MapProps> = ({ 
  center, 
  patientLocation, 
  ambulances = [], 
  hospitals = [],
  onAmbulanceClick,
  onHospitalClick,
  className = "map-container"
}) => {
  return (
    <div className={className}>
      <MapContainer 
        center={[center.latitude, center.longitude]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {patientLocation && (
          <Marker position={[patientLocation.latitude, patientLocation.longitude]} icon={patientIcon}>
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>
        )}

        {ambulances.map(amb => (
          <Marker 
            key={amb.id} 
            position={[amb.location.latitude, amb.location.longitude]} 
            icon={ambulanceIcon}
            eventHandlers={{ click: () => onAmbulanceClick?.(amb) }}
          >
            <Popup>
              <strong>{amb.ambulance_number}</strong><br />
              Status: {amb.status}<br />
              Driver: {amb.driver_name}<br />
              Phone: {amb.phone}
            </Popup>
          </Marker>
        ))}

        {hospitals.map(hosp => (
          <Marker 
            key={hosp.id} 
            position={[hosp.location.latitude, hosp.location.longitude]} 
            icon={hospitalIcon}
            eventHandlers={{ click: () => onHospitalClick?.(hosp) }}
          >
            <Popup>
              <strong>{hosp.name}</strong><br />
              Status: {hosp.status}<br />
              Phone: {hosp.phone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
