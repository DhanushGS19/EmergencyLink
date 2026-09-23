import React, { useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const libraries: "places"[] = ["places"];

export default function Map({ 
  center, 
  patientLocation, 
  ambulanceLocation, 
  hospitalLocation,
  directions 
}: any) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const mapCenter = useMemo(() => center || { lat: 20.5937, lng: 78.9629 }, [center]);

  if (!isLoaded) return <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 font-bold">Loading Map...</div>;

  return (
    <GoogleMap 
      zoom={14} 
      center={mapCenter} 
      mapContainerClassName="w-full h-full rounded-lg shadow-md"
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {patientLocation && <Marker position={patientLocation} label="You" />}
      {ambulanceLocation && <Marker position={ambulanceLocation} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
      {hospitalLocation && <Marker position={hospitalLocation} icon="http://maps.google.com/mapfiles/ms/icons/hospitals.png" />}
      
      {directions && (
        <DirectionsRenderer 
          directions={directions} 
          options={{ suppressMarkers: true }} 
        />
      )}
    </GoogleMap>
  );
}
