import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const Map = ({ coordinates, marker = true, height = '400px', zoom = 15 }) => {
  if (!coordinates) return <p>Loading map...</p>;

  return (
    <div style={{ height, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height, width: '100%' }}
        center={coordinates}
        zoom={zoom}
      >
        {marker && <Marker position={coordinates} />}
      </GoogleMap>
    </div>
  );
};

export default Map;
