import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const Map = ({ coordinates, marker = true, height = '400px', zoom = 15 }) => {
  const [mapError, setMapError] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Handle map loading and errors independently in each component
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLEMAP_API_KEY,
    nonce: import.meta.env.VITE_CSP_NONCE || undefined, // Optional nonce for CSP
  });

  useEffect(() => {
    // Log the API key status (do not log the actual key in production)
    if (import.meta.env.VITE_GOOGLEMAP_API_KEY) {
      console.log("Google Maps API key is configured");
    } else {
      console.warn("Google Maps API key is missing");
    }
    
    // Clean up function
    return () => {
      if (mapInstance) {
        // Clean up if needed
      }
    };
  }, [mapInstance]);

  if (loadError) {
    console.error("Error loading maps:", loadError);
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p>Could not load Google Maps: {loadError.message || 'Unknown error'}</p>
        <p>Please check that the API key is correct and has proper permissions.</p>
      </div>
    );
  }

  if (!isLoaded || !coordinates) {
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height, width: '100%' }}
        center={coordinates}
        zoom={zoom}
        onLoad={(map) => {
          console.log("Map loaded successfully");
          setMapInstance(map);
        }}
        onError={(e) => {
          console.error("Map error:", e);
          setMapError(e);
        }}
      >
        {marker && coordinates && <Marker position={coordinates} />}
      </GoogleMap>
      {mapError && (
        <div className="mt-2 text-red-500 text-sm p-2 bg-red-50 rounded">
          Error loading map details: {mapError.message || "Unknown error"}. 
          If this persists, please check API key configuration.
        </div>
      )}
    </div>
  );
};

export default Map;
