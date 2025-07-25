import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../services/api';
import { SearchBarHotelDetails } from "../components/SearchBarHotelDetails";
import Map from '../components/Map';
import RoomGrid from '../components/RoomGrid';


const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false); // for description popup, need improve later (overflows)
  //const [showMap, setShowMap] = useState(false); // for google map popup
  const [selectedFilter, setSelectedFilter] = useState('all');
  const filteredRooms = rooms.filter(room => {
  if (selectedFilter === 'all') return true;
  if (selectedFilter === '1') return room.roomDescription?.toLowerCase().includes('1');
  if (selectedFilter === '2') return room.roomDescription?.toLowerCase().includes('2');
  return true;
});

  useEffect(() => {
    // First API call: get hotel details and images
    ApiService.getHotelById(id)
      .then((data) => {
        setHotel(data);

        const { prefix, suffix } =  data.image_details;
        const indices = data.hires_image_index
          .split(',')
          .map((str) => str.trim())
          .filter((str) => str !== '');

        const imageUrls = indices.map((index) => `${prefix}${index}${suffix}`);
        setImages(imageUrls);
      })
      .catch((err) => console.error(err));

    // Second API call: get hotel rooms
    const query = {
      destination_id: 'diH7',
      checkin: '2025-10-10',
      checkout: '2025-10-17',
      guests: 2,
      currency: 'SGD',
      country_code: 'SG',
      lang: 'en_US',
      partner_id: 1
    };

    ApiService.getHotelRoomsByID(id, query)
      .then((data) => {
        setRooms(data.rooms);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoadingRooms(false);
      });

  }, [id]);

  if (!hotel) return <div>Loading hotel details...</div>;

  return (
    
    <div>
      <SearchBarHotelDetails/>
      <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-6">
        <h1 className="text-2xl font-bold text-[#0e151b] mb-6">{hotel.name}</h1>
        <div className="flex flex-col md:flex-row gap-8 mb-6">

          <img
            src={images[0]}
            alt="Main Hotel View"
            className="rounded-xl w-full md:w-[600px] h-[350px] object-cover"
          />

          <div className="flex flex-col justify-start md:w-1/2">
            <h2 className="text-xl font-semibold text-[#0e151b] mb-2">About this place</h2>
            <a href="#" className="text-sm text-[#1a73e8] underline mb-2">📍 {hotel.address} </a>
            <p className="text-sm text-[#0e151b] leading-relaxed max-w-lg">
              {hotel.description?.split('. ').slice(0, 3).join('. ') + '.'}
            </p>
            <button
              onClick={() => setShowDescriptionModal(true)}
              className="mt-2 text-sm text-[#1a73e8] underline self-start"
            >
              View more details...
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto py-4">
          {images.map((url, idx) => (
            <img 
              key={idx} 
              src={url} 
              alt={`Hotel image ${idx + 1}`} 
              className="w-48 h-32 object-cover rounded-xl flex-shrink-0" 
            />
          ))}
        </div>
      </div>
      {showDescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Full Description</h2>
            <p className="text-sm text-[#0e151b] leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="text-sm text-[#1a73e8] underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}





      <Map coordinates={{ lat: hotel.latitude, lng: hotel.longitude }} />
      <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-10">
        <h2 className="text-2xl font-bold text-[#0e151b] mb-4">Choose your room</h2>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          {['all', '2', '1'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-4 py-2 rounded-full border 
                ${selectedFilter === type ? 'bg-black text-white' : 'bg-gray-100 text-black'} 
                hover:bg-gray-200 transition`}
            >
              {type === 'all' ? 'All rooms' : `${type} Bed`}
            </button>
          ))}
        </div>

        {/* Grid of Room Cards */}
        <RoomGrid rooms={filteredRooms} loading={loadingRooms} />
      </div>




      {/* Skeleton code for reference */}
      <h1>Name: {hotel.name}</h1>
      <p><strong>Address:</strong> {hotel.address}</p>
      <p><strong>Rating:</strong> {hotel.rating ? hotel.rating : 'N/A'}</p>
      <p><strong>Description:</strong> {hotel.description ? hotel.description : 'No description available.'}</p>
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div>
          <strong>Amenities:</strong>
          <ul>
            {hotel.amenities.map((amenity, idx) => (
              <li key={idx}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}

      <h2>Static Photos</h2>
      <div style={{ display: 'flex', overflowX: 'scroll', gap: '8px' }}>
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={`Hotel image ${idx}`} width={200} />
        ))}
      </div>

      <br />

      <h1>Available Rooms</h1>
      {loadingRooms ? (
        <p>Loading room details...</p>
      ) : rooms.length > 0 ? (
        rooms.map((room, idx) => (
          <div key={idx} style={{ marginBottom: '24px', border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}>
            <h3>{room.roomDescription}</h3>

            <div style={{ display: 'flex', overflowX: 'scroll', gap: '8px' }}>
              {room.images && room.images.map((img, imgIdx) => (
                <img
                  key={imgIdx}
                  src={img.high_resolution_url || img.url}
                  alt={`Room ${idx} image ${imgIdx}`}
                  width={200}
                />
              ))}
            </div>

            <div style={{ marginTop: '10px' }}>
              <strong>Price (SGD):</strong> {room.converted_price ? room.converted_price.toFixed(2) : 'N/A'}
            </div>

            <div style={{ marginTop: '10px' }}>
              <strong>Long Description:</strong>
              <div dangerouslySetInnerHTML={{ __html: room.long_description }} />
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>Amenities:</strong>
                <ul>
                  {room.amenities.map((amenity, aIdx) => (
                    <li key={aIdx}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No rooms available for selected dates.</p>
      )}
    </div>
  );
};

export default HotelDetails;
