import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../services/api';
import Map from '../components/Map';
import SearchBar from '../components/SearchBar';
import RoomGrid from '../components/RoomGrid';
import { LoadScript } from '@react-google-maps/api';
import { useRef } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';


const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mapModalRef = useRef(null);
  const descModalRef = useRef(null);
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showMapModal, setShowMapModal] = useState(false); // for Google map to show in popup
  const [hotelDetails, setHotelDetails] = useState({
    name: '',
    room: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    nights: 0,
    price: 0,
  });

  // Get query parameters from the URL
  const queryParams = new URLSearchParams(location.search);
  const destination_id = queryParams.get('destination_id');
  const checkin = queryParams.get('checkin');
  const checkout = queryParams.get('checkout');
  const guests = queryParams.get('guests');
  const currency = queryParams.get('currency');
  const country_code = queryParams.get('country_code');
  const lang = queryParams.get('lang');

  // Validate required query parameters
  if (!destination_id || !checkin || !checkout || !guests || !currency || !country_code || !lang) {
    return <div>Error: Missing required query parameters</div>;
  }

  const filteredRooms = rooms.filter(room => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '1') return room.roomDescription?.toLowerCase().includes('1');
    if (selectedFilter === '2') return room.roomDescription?.toLowerCase().includes('2');
    return true;
  });

  // Outside Click
  useOutsideClick(mapModalRef, () => setShowMapModal(false));
  useOutsideClick(descModalRef, () => setShowDescriptionModal(false));


  // Update hotelDetails object based on the first room in rooms
  useEffect(() => {
    if (rooms.length > 0) {
      const firstRoom = rooms[0]; // Get the first room
      const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 3600 * 24)); // Calculate number of nights

      setHotelDetails({
        name: hotel?.name || '',
        room: firstRoom.roomDescription, // Set room to the first room
        checkIn: checkin,
        checkOut: checkout,
        guests: guests,
        nights: nights,
        price: firstRoom.converted_price || 500, // Assuming price comes from first room
      });
    }
  }, [rooms, hotel, checkin, checkout, guests]); // for room grid , the button only brings to first room


  
  const handleBookNow = () => {
    // Pass hotelDetails to the booking page
    navigate('/booking', { state: { hotelDetails } });
  };

  useEffect(() => {
    // First API call: get hotel details and images
    ApiService.getHotelById(id)
      .then((data) => {
        setHotel(data);

        const { prefix, suffix } = data.image_details;
        const indices = data.hires_image_index
          .split(',')
          .map((str) => str.trim())
          .filter((str) => str !== '');

        const imageUrls = indices.map((index) => `${prefix}${index}${suffix}`);
        setImages(imageUrls);
      })
      .catch((err) => console.error(err));

    // Second API call: get hotel rooms with dynamic query
    const query = {
      destination_id,
      checkin,
      checkout,
      guests,
      currency,
      country_code,
      lang,
      partner_id: 1, // Static partner_id
    };

    ApiService.getHotelRoomsByID(id, query)
      .then((data) => {
        setRooms(data.rooms);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoadingRooms(false);
      });

  }, [id, destination_id, checkin, checkout, guests, currency, country_code, lang]);

  if (!hotel) return <div>Loading hotel details...</div>;

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY}>
      <div>
        <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-6">
          <div className="w-full border-b border-gray-200 bg-white mb-6">
            <div className="w-full px-6 sm:px-16 py-4 bg-[#f2f2f4] rounded-xl shadow-sm">
              <SearchBar
                placeholder="Paris, France"
                size="hotelDetailPage"
                className="w-full max-w-screen-xl mx-auto"
                onSearch={(query, results) => {
                  console.log("Hotel details search triggered:", query, results);
                }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0e151b] mb-6">{hotel.name}</h1>
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <img
              src={images[0]}
              alt="Main Hotel View"
              className="rounded-xl w-full md:w-[600px] h-[350px] object-cover"
            />
            <div className="flex flex-col justify-start md:w-1/2">
              <h2 className="text-xl font-semibold text-[#0e151b] mb-2">About this place</h2>
              <button
                onClick={() => setShowMapModal(true)}
                className="text-sm text-[#1a73e8] underline mb-2 text-left"
              >
                📍 {hotel.address}
              </button>
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
            <div 
              ref={descModalRef}
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            >
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

        <div style={{ display: 'none' }}>
          <Map coordinates={{ lat: hotel.latitude, lng: hotel.longitude }} height="0px" />
        </div>

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

        {/* Book Now Button */}
        <div style={{ margin: '20px 0' }}>
          <button
            onClick={handleBookNow}
            style={{
              backgroundColor: '#47a6ea',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#3690d4'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#47a6ea'}
          >
            Book Now - {hotelDetails.name}
          </button>
        </div>


        {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            ref={mapModalRef}
            className="bg-white rounded-xl p-4 max-w-3xl w-full mx-4 relative"
          >
            <h2 className="text-xl font-semibold mb-2">Hotel Location</h2>
            <div className="rounded-xl overflow-hidden">
              <Map coordinates={{ lat: hotel.latitude, lng: hotel.longitude }} height="400px" />
            </div>
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-2 right-4 text-[#1a73e8] text-sm underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      </div>
    </LoadScript>
  );
};

export default HotelDetails;
