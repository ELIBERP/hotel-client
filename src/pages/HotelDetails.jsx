import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../services/api';
import Map from '../components/Map';
import RoomGrid from '../components/RoomGrid';
import { LoadScript } from '@react-google-maps/api';
import Skeleton from '../components/Skeleton';
import Spinner from '../components/Spinner';
import { roomAmenityKeys } from '../constants/amenities';
import AmenityChip from '../components/AmenityChip';
import CatHotelImage from '../assets/CatHotelImage.svg';
import { parseNearby } from '../utils/parseNearby';
import useOutsideClick from '../hooks/useOutsideClick';
import destinations from '../assets/destinations.json';

const FALLBACK = CatHotelImage; 

const formatBreakfast = (code) => {
  switch (code) {
    case 'hotel_detail_room_only':
      return 'Not included';
    case 'hotel_detail_breakfast_included':
      return 'Included';
    case 'hotel_detail_breakfast_available':
    case 'hotel_detail_breakfast_optional':
      return 'Available (extra charge)';
    default:
      return 'Not included';
  }
};

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
  const [primaryImage, setPrimaryImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]); 
  const [primaryResolved, setPrimaryResolved] = useState(false);
  const [hotelAmenityKeys, setHotelAmenityKeys] = useState([]);   // for icons under the description
  const [roomHideKeys, setRoomHideKeys] = useState(new Set());    // common across all rooms
  const nearbyHotels = location.state?.nearbyHotels || [];
  const mapModalRef = useRef(null);
  const descModalRef = useRef(null);
  const [hotel, setHotel] = useState(null);  
  const roomModalRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // for the room modal
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const pageTopRef = useRef(null);
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
  const country_code = 'SG';
  const lang = queryParams.get('lang');
  // Validate required query parameters
  if (!destination_id || !checkin || !checkout || !guests || !currency || !country_code || !lang) {
    return <div>Error: Missing required query parameters</div>;
  }
  // Pre-fill destination text from current destination_id
const selectedDestinationName =
  destinations.find(d => d.uid === destination_id)?.term || '';

// --- Mini search bar state (same as HotelSearchResults) ---
const [miniDestInput, setMiniDestInput] = useState(
  selectedDestinationName !== 'Unknown location' ? selectedDestinationName : ''
);
const [miniDestId, setMiniDestId] = useState(destination_id || '');
const [showDestSuggestions, setShowDestSuggestions] = useState(false);

const [checkinDate, setCheckinDate] = useState(checkin || '');
const [checkoutDate, setCheckoutDate] = useState(checkout || '');

const [adults, setAdults] = useState(2);
const [children, setChildren] = useState(0);
const [roomCount, setRoomCount] = useState(1);
const [showGuestPicker, setShowGuestPicker] = useState(false);

// Suggestions (same logic as results page)
const destSuggestions = miniDestInput.length > 1
  ? destinations
      .filter(d => d.term && d.term.toLowerCase().includes(miniDestInput.toLowerCase()))
      .slice(0, 8)
  : [];

const handleSelectDestination = (d) => {
  setMiniDestInput(d.term);
  setMiniDestId(d.uid);
  setShowDestSuggestions(false);
};

const adjustAdults   = (delta) => setAdults(a => Math.min(10, Math.max(1, a + delta)));
const adjustChildren = (delta) => setChildren(c => Math.min(10, Math.max(0, c + delta)));
const adjustRoomCount = (delta) => setRoomCount(r => Math.min(8, Math.max(1, r + delta)));

const formatGuestsParam = () => {
  const total = adults + children;
  if (roomCount <= 1) return String(total);
  return Array(roomCount).fill(total).join('|');
};

// Submit: navigate to /hotels (the results page handles fetching/pricing)
const handleMiniSearch = (e) => {
  e.preventDefault();

  let destId = miniDestId;
  if (!destId && destSuggestions.length) destId = destSuggestions[0].uid;
  if (!destId) return; // require destination

  const qs = new URLSearchParams({
    destination_id: destId,
    checkin: checkinDate || '',
    checkout: checkoutDate || '',
    guests: formatGuestsParam(),
  }).toString();

  navigate(`/hotels?${qs}`, { state: { hasSearched: true } });
};

  const extractBedCount = (long_description) => { // to filter by bed count, we extract bed count from long desc
    if (!long_description) return 0;
    const div = document.createElement('div');
    div.innerHTML = long_description;
    const firstP = div.querySelector('p')?.textContent || '';
    const match = firstP.match(/(\d+)/); // matches "1", "2", etc.
    return match ? parseInt(match[1], 10) : 0;
  };

  // Normalize protocol-less prefixes like "//..." to "https://..."
const normalizePrefix = (p) => (p?.startsWith('//') ? `https:${p}` : (p || ''));

// Build candidate image URLs from API data
const buildImageUrls = (data, limit = 12) => {
  const prefixRaw = data?.image_details?.prefix || '';
  const suffix = data?.image_details?.suffix || '';
  const prefix = normalizePrefix(prefixRaw);

  // Case 1: use hires_image_index if present
  const hires = (data?.hires_image_index || '').trim();
  if (hires) {
    const idxs = hires
      .split(',')
      .map(s => s.trim())
      .filter(s => /^\d+$/.test(s))
      .slice(0, limit);
    return (prefix && suffix) ? idxs.map(i => `${prefix}${i}${suffix}`) : [];
  }

  // Case 2: fall back to default_image_index + number_of_images
  const total = Number(data?.number_of_images) || 0;
  const def = Math.max(1, Number(data?.default_image_index) || 1);

  if (!prefix || !suffix || total <= 0) return [];

  // Order: def..total, then 1..def-1 (so default shows first)
  const idxs = [];
  for (let i = def; i <= total && idxs.length < limit; i++) idxs.push(i);
  for (let i = 1; i < def && idxs.length < limit; i++) idxs.push(i);

  return idxs.map(i => `${prefix}${i}${suffix}`);
};

// Resolve with the first URL that actually loads
const preloadFirstWorking = (urls, timeoutMs = 8000) =>
  new Promise((resolve) => {
    if (!urls?.length) return resolve(null);
    let i = 0;
    const tryNext = () => {
      if (i >= urls.length) return resolve(null);
      const url = urls[i++];
      const img = new Image();
      const timer = setTimeout(() => {
        img.onload = img.onerror = null;
        tryNext();
      }, timeoutMs);
      img.onload = () => { clearTimeout(timer); resolve(url); };
      img.onerror = () => { clearTimeout(timer); tryNext(); };
      img.src = url;
    };
    tryNext();
  });

  const probeImages = async (urls, limit = 10, timeoutMs = 3500) => {
    const slice = (urls || []).slice(0, limit);
    const checks = slice.map((url, idx) =>
      new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => {
          img.onload = img.onerror = null;
          resolve({ url, ok: false, idx });
        }, timeoutMs);
        img.onload = () => { clearTimeout(timer); resolve({ url, ok: true, idx }); };
        img.onerror = () => { clearTimeout(timer); resolve({ url, ok: false, idx }); };
        img.src = url;
      })
    );
    const results = await Promise.all(checks);
    return results.filter(r => r.ok).sort((a,b) => a.idx - b.idx).map(r => r.url);
  };
  const filteredRooms = rooms.filter((room) => {
    const bedCount = extractBedCount(room.long_description);
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '1') return bedCount === 1;
    if (selectedFilter === '2') return bedCount === 2;  
    return true;
  });

  // Outside click handlers for modals
  useOutsideClick(mapModalRef, () => setShowMapModal(false));
  useOutsideClick(descModalRef, () => setShowDescriptionModal(false));
  useOutsideClick(roomModalRef, () => setSelectedRoom(null));

  useEffect(() => { //for scroll lock
  document.body.style.overflow = showDescriptionModal ? 'hidden' : '';
  return () => {
    document.body.style.overflow = '';
  };
}, [showDescriptionModal]);

  useEffect(() => {
    pageTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });

    // Fallbacks in case a browser ignores scrollIntoView for nested containers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.key]);

  useEffect(() => {
  // Close any open modals
  setShowDescriptionModal(false);
  setSelectedRoom(null);

  // Clear hotel header + images so header skeleton shows
  setHotel(null);

  // Clear rooms so the grid skeleton shows
  setRooms([]);
  setLoadingRooms(true);

  // Clear amenity-derived UI so old chips don't flash
  setHotelAmenityKeys([]);
  setRoomHideKeys(new Set());
  setPrimaryImage(null);   
  setGalleryImages([]); 
  setPrimaryResolved(false);  
}, [id, location.key]);



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

  // mock for ky
  const handleBookSelectedRoom = (room) => {
    
    const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 3600 * 24));
    const selectedDetails = {
      id: hotel?.hotelId || hotel?.id || hotel?.hotel_id || `hotel_${Date.now()}`,
      name: hotel?.name || 'No Hotel Selected',
      room: room.roomDescription || room.name || 'No Room Selected',
      checkIn: checkin || '2026-01-01',
      checkOut: checkout || '2026-02-02',
      guests: parseInt(guests) || 1,
      nights: nights || 1,
      price: room.converted_price || room.price || 0,
      currency: currency || 'SGD',
    };

    navigate('/booking-form', { state: { hotelDetails: selectedDetails } });
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const hotelData = await ApiService.getHotelById(id);
        if (cancelled) return;

        // build candidates
        const imageUrls = buildImageUrls(hotelData);
        setHotel(hotelData);
        // header image
        const primary = await preloadFirstWorking(imageUrls);
        if (cancelled) return;

        setPrimaryImage(primary);
        setPrimaryResolved(true); // ✅ we’re done deciding the header image

        // gallery = verified working images beyond the header
        const rest = (imageUrls || []).filter(u => u && u !== primary);
        const verified = await probeImages(rest, 10, 3500);
        if (!cancelled) setGalleryImages(verified);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setPrimaryResolved(true); // ✅ fail-safe: stop skeleton, show fallback
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

useEffect(() => {
  let cancelled = false;

  setLoadingRooms(true);
  setRooms([]);

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

  ApiService.getHotelRoomsByID(id, query)
    .then((roomsData) => {
      if (cancelled) return;

      const rawRooms = Array.isArray(roomsData?.rooms) ? roomsData.rooms : [];
      const roomsWithAmenityKeys = rawRooms.map(r => ({
        ...r,
        importantAmenityKeys: roomAmenityKeys(r?.amenities),
      }));

      setRooms(roomsWithAmenityKeys);
      
    })
    .catch((e) => { if (!cancelled) console.error(e); })
    .finally(() => { if (!cancelled) setLoadingRooms(false); });

  return () => { cancelled = true; };
}, [id, destination_id, checkin, checkout, guests, currency, country_code, lang]);

  useEffect(() => {
    // If hotel not ready yet, clear chips to avoid stale display
    if (!hotel) {
      setHotelAmenityKeys([]);
      setRoomHideKeys(new Set());
      return;
    }

    // Keys common across all rooms
    const commonAcrossRooms = rooms.length
      ? rooms
          .map(r => new Set(r.importantAmenityKeys || []))
          .reduce((acc, set) => (!acc ? set : new Set([...acc].filter(k => set.has(k)))), null)
      : new Set();

    // Simple hotel-level booleans
    const a = hotel?.amenities || {};
    const hotelBooleanKeys = [
      a.continentalBreakfast ? 'continentalBreakfast' : null,
      a.parkingGarage ? 'parkingGarage' : null,
      a.dryCleaning ? 'dryCleaning' : null,
    ].filter(Boolean);

    setHotelAmenityKeys(Array.from(new Set([...(hotelBooleanKeys), ...commonAcrossRooms])));
    setRoomHideKeys(new Set(hotelBooleanKeys));
  }, [hotel, rooms]);



  const longHtml = hotel?.long_description || hotel?.description || '';
  const nearby = React.useMemo(() => parseNearby(longHtml), [longHtml]);

  // Convert HTML to readable text (replace <br> with newlines, strip tags)
const htmlToText = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
  return (div.textContent || '').trim();
};

// Keep only the “about” paragraph(s), drop the distances/airports block
const aboutOnlyHtml = longHtml.split(/Distances are displayed/i)[0] || longHtml;
const aboutText = htmlToText(aboutOnlyHtml);



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
      <div ref={pageTopRef} aria-hidden="true" />
      <div>
        <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-16 py-6">
          <div className="w-full max-w-screen-xl mx-auto mb-6">
            <form
              onSubmit={handleMiniSearch}
              className="bg-white/90 border border-gray-200 rounded-2xl shadow p-4 md:p-5 flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Destination */}
                <div className="relative md:flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Destination</label>
                  <input
                    type="text"
                    value={miniDestInput}
                    onChange={(e)=>{ setMiniDestInput(e.target.value); setShowDestSuggestions(true); }}
                    onFocus={()=> setShowDestSuggestions(true)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Where to?"
                  />
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-auto">
                      {destSuggestions.map(d => (
                        <button
                          type="button"
                          key={d.uid}
                          onClick={()=>handleSelectDestination(d)}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {d.term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex gap-4 md:w-[320px]">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkinDate}
                      onChange={e=>setCheckinDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={e=>setCheckoutDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Guests & Rooms */}
                <div className="relative md:w-56">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Guests & Rooms</label>
                  <button
                    type="button"
                    onClick={()=>setShowGuestPicker(o=>!o)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-left flex justify-between items-center hover:border-gray-400"
                  >
                    <span>{adults + children} guests, {roomCount} room{roomCount>1?'s':''}</span>
                  </button>
                  {showGuestPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow p-3 text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Adults</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={()=>adjustAdults(-1)} className="w-6 h-6 flex items-center justify-center border rounded" aria-label="Decrease adults">-</button>
                          <span>{adults}</span>
                          <button type="button" onClick={()=>adjustAdults(1)} className="w-6 h-6 flex items-center justify-center border rounded" aria-label="Increase adults">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Children</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={()=>adjustChildren(-1)} className="w-6 h-6 flex items-center justify-center border rounded">-</button>
                          <span>{children}</span>
                          <button type="button" onClick={()=>adjustChildren(1)} className="w-6 h-6 flex items-center justify-center border rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Rooms</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={()=>adjustRoomCount(-1)} className="w-6 h-6 flex items-center justify-center border rounded">-</button>
                          <span>{roomCount}</span>
                          <button type="button" onClick={()=>adjustRoomCount(1)} className="w-6 h-6 flex items-center justify-center border rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={()=>setShowGuestPicker(false)} className="text-xs text-blue-600 font-medium">Done</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="md:w-32 flex items-end">
                  <button
                    type="submit"
                    className="w-full h-[42px] md:h-[46px] rounded-lg bg-[#47a6ea] hover:bg-[#3690d4] text-white font-semibold text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          <h1 className="text-2xl font-bold text-[#0e151b] mb-6">{hotel.name}</h1>
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="rounded-xl w-full md:w-[600px] h-[350px] overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt="Main Hotel View"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK;
                  }}
                />
              ) : primaryResolved ? (
                <img
                  src={FALLBACK}
                  alt="Main Hotel View"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full">
                  <Skeleton className="w-full h-full rounded-xl" />
                </div>
              )}
            </div>

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

              {hotelAmenityKeys.length > 0 && (
                <section className="mt-6">
                  <h3 className="text-xl font-semibold text-[#0e151b] mb-2">Hotel Amenities</h3>
                  <div className="flex flex-wrap gap-2" aria-label="Hotel amenities">
                    {hotelAmenityKeys.map(k => <AmenityChip key={k} k={k} size="lg" />)}
                  </div>
                </section>
              
              )}
              
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className="flex gap-4 overflow-x-auto py-4">
              {galleryImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Hotel image ${idx + 2}`} // +2 because header is #1
                  className="w-48 h-32 object-cover rounded-xl flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    // If a verified image somehow fails later, hide that thumb
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
          
        </div>
        {showDescriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              ref={descModalRef}
              className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6" 
            >
              <h2 className="text-xl font-semibold mb-4">Full Description</h2>

              {/* Cleaned description (no <br> spam) */}
              <p className="text-sm text-[#0e151b] leading-relaxed whitespace-pre-line">
                {aboutText}
              </p>

              {/* What's nearby (POIs only; airports already filtered by parseNearby) */}
              {nearby.pois.length > 0 && (
                <section className="mt-6">
                  <h3 className="text-lg font-semibold text-[#0e151b] mb-2">What’s nearby</h3>
                  <ul className="space-y-1">
                    {nearby.pois.slice(0, 12).map((p, i) => (
                      <li key={`poi-${i}`} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] leading-none mt-[2px]">
                          place
                        </span>
                        <span>
                          {p.name}{' '}
                          <span className="text-gray-500">— {p.km} km / {p.mi} mi</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
            googleMapsApiKey={import.meta.env.VITE_GOOGLEMAP_API_KEY}
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
              key={`${id}-${checkin}-${checkout}-${guests}-${currency}-${lang}`}
              rooms={filteredRooms}
              loading={loadingRooms}
              onRoomClick={(room) => setSelectedRoom(room)}
              roomHideKeys={roomHideKeys}
            />
          )}
        </div>

        {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
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
              {formatBreakfast(selectedRoom?.roomAdditionalInfo?.breakfastInfo)}
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
              .filter(h => String(h.id) !== String(id))
              .slice(0, 3)
              .map(hotel => {
                const prefixRaw = hotel.image_details?.prefix || '';
                const suffix = hotel.image_details?.suffix || '';
                const prefix = prefixRaw.startsWith('//') ? `https:${prefixRaw}` : prefixRaw;

                let idxs = (hotel.hires_image_index || '')
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => /^\d+$/.test(s));

                if (idxs.length === 0) {
                  const total = Number(hotel.number_of_images) || 0;
                  const def = Math.max(1, Number(hotel.default_image_index) || 1);
                  // Take up to 3 candidates around the default
                  for (let i = def; i <= total && idxs.length < 3; i++) idxs.push(String(i));
                  for (let i = 1; i < def && idxs.length < 3; i++) idxs.push(String(i));
                }

                const candidates = (prefix && suffix) ? idxs.map(i => `${prefix}${i}${suffix}`) : [];
                const bg = [...candidates, CatHotelImage].map(u => `url("${u}")`).join(', ');

                return (
                  <div
                    key={hotel.id}
                    onClick={() =>
                      navigate(`/hotels/${hotel.id}${location.search}`, {
                        state: { nearbyHotels },
                      })
                    }
                    className="cursor-pointer flex-none flex flex-col gap-2 w-[240px] rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
                  >
                    <div
                      className="w-full aspect-[16/9] bg-cover bg-center rounded-t-xl"
                      style={{ backgroundImage: bg }}
                    />
                    <div className="p-4">
                      <p
                        className="text-[#111518] font-medium text-base hover:underline break-words"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '44px', // ~2 lines at base size
                          lineHeight: '1.25',
                        }}
                      >
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
