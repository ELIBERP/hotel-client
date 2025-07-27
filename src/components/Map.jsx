// components/Map.jsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = ({ coordinates, marker = true, height = '400px', zoom = 15 }) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLEMAP_API_KEY;

  if (!coordinates) return <p>Loading map...</p>;

  return (
    <div style={{ height, width: '100%' }}>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ height, width: '100%' }}
          center={coordinates}
          zoom={zoom}
        >
          {marker && <Marker position={coordinates} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
