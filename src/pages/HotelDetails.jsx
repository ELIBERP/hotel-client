import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../services/api';
import Map from '../components/Map';
import SearchBar from '../components/SearchBar';
import RoomGrid from '../components/RoomGrid';
import { LoadScript } from '@react-google-maps/api';
import { useRef } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';
import React, { useEffect, useState } from 'react';
import Skeleton from '../components/Skeleton';
import Spinner from '../components/Spinner';

const MIN_LOADING_MS = 200;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const HotelHeaderSkeleton = () => (
  <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-6">
    <div className="w-full border-b border-gray-200 bg-white mb-6">
      <div className="w-full px-6 sm:px-16 py-4 bg-[#f2f2f4] rounded-xl shadow-sm">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>

    <Skeleton className="h-8 w-64 mb-6 rounded" />

    <div className="flex flex-col md:flex-row gap-8 mb-6">
      <Skeleton className="w-full md:w-[600px] h-[350px] rounded-xl" />
      <div className="flex flex-col md:w-1/2 gap-3">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-56 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-4/6 rounded" />
        <Skeleton className="h-4 w-3/6 rounded" />
        <div className="mt-2">
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>
    </div>

   
  </div>
);

const RoomGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
        <Skeleton className="w-full h-40 rounded-lg mb-3" />
        <Skeleton className="h-5 w-3/4 rounded mb-2" />
        <Skeleton className="h-4 w-2/3 rounded mb-2" />
        <Skeleton className="h-4 w-1/2 rounded mb-4" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);


const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const nearbyHotels = location.state?.nearbyHotels || [];
  const mapModalRef = useRef(null);
  const descModalRef = useRef(null);
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const roomModalRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // for the room modal
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
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false); // State to track if Google Maps API is loaded

  // Get query parameters from the URL
  const queryParams = new URLSearchParams(location.search);
  const destination_id = queryParams.get('destination_id');
  const checkin = queryParams.get('checkin');
  const checkout = queryParams.get('checkout');
  const guests = queryParams.get('guests');
  const currency = queryParams.get('currency');
  //const country_code = queryParams.get('country_code');
  const country_code = 'SG';
  const lang = queryParams.get('lang');

  // Validate required query parameters
  if (!destination_id || !checkin || !checkout || !guests || !currency || !country_code || !lang) {
    return <div>Error: Missing required query parameters</div>;
  }

  const extractBedCount = (long_description) => { // to filter by bed count, we extract bed count from long desc
    if (!long_description) return 0;
    const div = document.createElement('div');
    div.innerHTML = long_description;
    const firstP = div.querySelector('p')?.textContent || '';
    const match = firstP.match(/(\d+)/); // matches "1", "2", etc.
    return match ? parseInt(match[1], 10) : 0;
  };



  const filteredRooms = rooms.filter((room) => {
    const bedCount = extractBedCount(room.long_description);
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '1') return bedCount === 1;
    if (selectedFilter === '2') return bedCount === 2;  

    return true;
  });

  // Outside Click
  //ref={descModalRef} add this line to detect clicks outside the box for implementation of useOutsideClick
  useOutsideClick(mapModalRef, () => setShowMapModal(false)); // Google map popup
  useOutsideClick(descModalRef, () => setShowDescriptionModal(false)); // Hotel Desc popup
  useOutsideClick(roomModalRef, () => setSelectedRoom(null)); // Room Detail popup


  // for page refresh when choosing another hotel under recommendation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);


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


  // This is the real data. But sometimes unable to take it from feature 2
  const handleBookSelectedRoom = (room) => {
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 3600 * 24));
    const selectedDetails = {
      name: hotel?.name || '',
      room: room.roomDescription,
      checkIn: checkin,
      checkOut: checkout,
      guests: guests,
      nights: nights,
      price: room.converted_price || 500,
    };

    // MOCK DATA for KY
    // const handleBookSelectedRoom = (room) => {
    //   const nights = 2;
    //   const selectedDetails = {
    //   name: "ibis budget Singapore Selegie",
    //   room: "Superior Room, 2 Twin Beds",
    //   checkIn: "2025-08-29",
    //   checkOut: "2025-08-31",
    //   guests: 2,
    //   nights: 2,
    //   price: 321.22,
    // };

    navigate('/booking', { state: { hotelDetails: selectedDetails } });
  };
  
  const handleBookNow = () => {
    // Pass hotelDetails to the booking page
    navigate('/booking', { state: { hotelDetails } });
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Immediately reset UI so old details don't flash
      setShowDescriptionModal(false);
      setHotel(null);          // triggers your skeleton + spinner
      setImages([]);
      setRooms([]);
      setLoadingRooms(true);

      const start = performance.now();

      // Build query once
      const query = {
        destination_id,
        checkin,
        checkout,
        guests,
        currency,
        country_code,
        lang,
        partner_id: 1,
      };

      try {
        // Fetch both in parallel
        const [hotelData, roomsData] = await Promise.all([
          ApiService.getHotelById(id),
          ApiService.getHotelRoomsByID(id, query),
        ]);
        if (cancelled) return;

        // Prepare images safely
        const prefix = hotelData?.image_details?.prefix || '';
        const suffix = hotelData?.image_details?.suffix || '';
        const hires = typeof hotelData?.hires_image_index === 'string' ? hotelData.hires_image_index : '';
        const indices = hires.split(',').map(s => s.trim()).filter(Boolean);
        const imageUrls = (prefix && suffix) ? indices.map(index => `${prefix}${index}${suffix}`) : [];

        // Enforce minimum loading time
        const elapsed = performance.now() - start;
        if (elapsed < MIN_LOADING_MS) {
          await delay(MIN_LOADING_MS - elapsed);
          if (cancelled) return;
        }

        // Hydrate the new content
        setHotel(hotelData);
        setImages(imageUrls);
        setRooms(Array.isArray(roomsData?.rooms) ? roomsData.rooms : []);
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, destination_id, checkin, checkout, guests, currency, country_code, lang]);

  if (!hotel) {
    return (
      <div className="animate-fade-in relative min-h-[70vh]">
        {/* Centered spinner overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <Spinner size={36} className="text-blue-500" />
        </div>

        <HotelHeaderSkeleton />
        <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-10">
          <h2 className="text-2xl font-bold text-[#0e151b] mb-4">Choose your room</h2>
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <RoomGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div>
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
            {images[0] ? (
              <img
                src={images[0]}
                alt="Main Hotel View"
                className="rounded-xl w-full md:w-[600px] h-[350px] object-cover"
                loading="lazy"
              />
            ) : (
              <Skeleton className="rounded-xl w-full md:w-[600px] h-[350px]" />
            )}

            <div className="flex flex-col justify-start md:w-1/2">
              <h2 className="text-xl font-semibold text-[#0e151b] mb-2">About this place</h2>

              {hotel.address ? (
                <button
                  onClick={() => setShowMapModal(true)}
                  className="text-sm text-[#1a73e8] underline mb-2 text-left"
                >
                  📍 {hotel.address}
                </button>
              ) : (
                <Skeleton className="h-4 w-56 rounded mb-2" />
              )}

              {hotel.description ? (
                <p className="text-sm text-[#0e151b] leading-relaxed max-w-lg">
                  {hotel.description.split('. ').slice(0, 3).join('. ') + '.'}
                </p>
              ) : (
                <>
                  <Skeleton className="h-4 w-5/6 rounded mb-2" />
                  <Skeleton className="h-4 w-4/6 rounded mb-2" />
                  <Skeleton className="h-4 w-3/6 rounded" />
                </>
              )}

              <button
                onClick={() => setShowDescriptionModal(true)}
                className="mt-2 text-sm text-[#1a73e8] underline self-start"
              >
                View more details...
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto py-4">
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Hotel image ${idx + 1}`}
                  className="w-48 h-32 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          
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

        {/* <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY}> */}
        {/* I really shouldnt expose this haha */}
        {!googleApiLoaded && (
          <LoadScript
            googleMapsApiKey={"AIzaSyAMA3VTBdscv_40tdyz0X4kfJKPG2i97QM"}
            onLoad={() => setGoogleApiLoaded(true)}
            loadingElement={<></>}         // 👈 hides the default "Loading..."
            // or: loading={<></>}         // 👈 if your version uses `loading`
          >
            <div style={{ display: 'none' }}>
              <Map coordinates={{ lat: hotel.latitude, lng: hotel.longitude }} height="0px" />
            </div>
          </LoadScript>
        )}
        <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-10">
          <h2 className="text-2xl font-bold text-[#0e151b] mb-4">Choose your room</h2>

          {/* Filter Buttons */}
          <div className="flex gap-4 mb-6">
            {['all', '1', '2'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-4 py-2 rounded-full border
                  ${selectedFilter === type ? 'bg-blue-400 text-black' : 'bg-blue-100 text-black'}
                  hover:bg-blue-400 transition`}
              >
                {type === 'all' ? 'All Rooms' : `${type} Bed${type !== '1' ? 's' : ''}`}
              </button>
            ))}
          </div>

          {/* Grid of Room Cards */}
          {loadingRooms ? (
            <RoomGridSkeleton count={6} />
          ) : (
            <RoomGrid
              rooms={filteredRooms}
              loading={loadingRooms}
              onRoomClick={(room) => setSelectedRoom(room)}
            />
          )}
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
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={roomModalRef}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedRoom.roomDescription}</h2>
              <button
                onClick={() => handleBookSelectedRoom(selectedRoom)}
                className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600"
              >
                Book Now
              </button>
            </div>

            <img
              src={
                selectedRoom.images?.[0]?.high_resolution_url ||
                selectedRoom.images?.[0]?.url
              }
              alt="Room Preview"
              className="w-full h-56 object-cover rounded mb-4"
            />

            {/* Long Description */}
            <div
              className="text-sm text-gray-700 space-y-2 mb-6"
              dangerouslySetInnerHTML={{ __html: selectedRoom.long_description }}
            />

            {/* Price */}
            <p className="text-sm mb-2">
              <strong>Price:</strong> {selectedRoom.converted_price} {currency}
            </p>

            {/* Breakfast Info */}
            <p className="text-sm mb-4">
              <strong>Breakfast:</strong>{' '}
              {selectedRoom.roomAdditionalInfo?.breakfastInfo === 'hotel_detail_room_only'
                ? 'Not included'
                : selectedRoom.roomAdditionalInfo?.breakfastInfo || '—'}
            </p>

            {/* Optional Display Fields (Safe) */}
            {selectedRoom.roomAdditionalInfo?.displayFields?.fees_optional && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-1">Optional Fees:</h3>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: selectedRoom.roomAdditionalInfo.displayFields.fees_optional,
                  }}
                />
              </div>
            )}

            {selectedRoom.roomAdditionalInfo?.displayFields?.know_before_you_go && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-1">Know Before You Go:</h3>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: selectedRoom.roomAdditionalInfo.displayFields.know_before_you_go,
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-sm text-[#1a73e8] underline"
              >
                Close
              </button>
              <button
                onClick={() => handleBookSelectedRoom(selectedRoom)}
                className="px-4 py-2 bg-blue-500 text-white rounded font-semibold text-sm hover:bg-blue-600"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      {nearbyHotels.length > 1 && (
      <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-10">
        <h2 className="text-2xl font-bold text-[#0e151b] mb-4">Other Hotels You Might Like</h2>
        <div className="flex overflow-x-auto gap-4 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nearbyHotels
            .filter(h => String(h.id) !== String(id)) // Exclude the current hotel
            .slice(0, 3) // Limit to 3 hotels
            .map(hotel => {
              const imageUrl = hotel.image_details?.prefix && hotel.hires_image_index
                ? `${hotel.image_details.prefix}${hotel.hires_image_index.split(',')[0].trim()}${hotel.image_details.suffix}`
                : 'https://dummyimage.com/400x300/cccccc/000000&text=No+Image';

              return (
                <div
                  key={hotel.id}
                  onClick={() =>
                    navigate(`/hotels/${hotel.id}${location.search}`, {
                      state: { nearbyHotels },
                    })
                  }
                  className="cursor-pointer flex flex-col gap-2 min-w-[220px] rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  <div
                    className="w-full aspect-video bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  <div className="p-4">
                    <p className="text-[#111518] font-medium text-base hover:underline">
                      {hotel.name}
                    </p>
                    <p className="text-[#637888] text-sm">
                      From ${hotel.price || '—'} · Rating: {hotel.rating || 'N/A'}
                    </p>
                  </div>
                </div>

              );
            })}
        </div>
      </div>
    )}
    </div>
  );
};

export default HotelDetails;
