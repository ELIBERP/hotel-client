// React and dependencies
import React, { useEffect, useState, useRef } from 'react';
import destinations from '../assets/destinations.json';
import StarRating from '../components/StarRating';
import { Link, useLocation } from 'react-router-dom';
import ApiService from '../services/api';

// Main hotel search results component
const HotelSearchResults = () => {
  // Helper: Calculate number of nights between check-in and check-out
  function getNights(checkin, checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = checkoutDate - checkinDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  // State variables for filters and data
  const [starFilter, setStarFilter] = useState(''); // Star rating filter
  const [priceMin, setPriceMin] = useState(''); // Minimum price filter
  const [priceMax, setPriceMax] = useState(''); // Maximum price filter
  const [priceSort, setPriceSort] = useState(''); // Price sort order
  const [hotels, setHotels] = useState([]); // List of hotels
  const [loading, setLoading] = useState(true); // Loading state
  const [prices, setPrices] = useState([]); // List of hotel prices
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const HOTELS_PER_PAGE = 15; // Number of hotels per page

  // Get query params from URL (destination, dates, guests)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destinationId = searchParams.get('destination_id');
  const searchQuery = searchParams.get('search');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const guests = parseInt(searchParams.get('guests'), 10);

  // Find destination name from uid
  const destEntry = destinations.find((d) => d.uid === destinationId);
  const selectedDestination = destEntry?.term || 'Unknown location';

  // --- Mini search bar state ---
  const [miniDestInput, setMiniDestInput] = useState(selectedDestination !== 'Unknown location' ? selectedDestination : '');
  const [miniDestId, setMiniDestId] = useState(destinationId || '');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [checkinDate, setCheckinDate] = useState(checkin || '');
  const [checkoutDate, setCheckoutDate] = useState(checkout || '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [displayDestination, setDisplayDestination] = useState(selectedDestination);
  // Committed dates used for price/night calculations (won't change until Search pressed)
  const [committedCheckin, setCommittedCheckin] = useState(checkin || '');
  const [committedCheckout, setCommittedCheckout] = useState(checkout || '');
  // Polling guards
  const isPollingRef = useRef(false);
  const abortPollRef = useRef(false);

  const pollPrices = async (priceQuery) => {
    if (isPollingRef.current) return; // avoid overlapping polls
    isPollingRef.current = true;
    abortPollRef.current = false;
    try {
      let priceData = await ApiService.getHotelsPrice(priceQuery);
      let pollCount = 0;
      let unchangedRounds = 0;
      let lastCount = priceData?.hotels?.length || 0;
      while (!abortPollRef.current && priceData && priceData.completed !== true && pollCount < 20) { 
        await new Promise(res => setTimeout(res, 1500)); // 1.5s interval to ease load
        const next = await ApiService.getHotelsPrice(priceQuery);
        const currentCount = next?.hotels?.length || 0;
        if (currentCount === lastCount) {
          unchangedRounds += 1;
        } else {
          unchangedRounds = 0;
          lastCount = currentCount;
        }
        priceData = next;
        pollCount++;
      }
      setPrices(priceData?.hotels || []);
    } catch (err) {
      console.error('Price polling failed:', err);
    } finally {
      isPollingRef.current = false;
    }
  };

  // Suggest destinations
  const destSuggestions = miniDestInput.length > 1
    ? destinations.filter(d => d.term && d.term.toLowerCase().includes(miniDestInput.toLowerCase())).slice(0,8)
    : [];

  const handleSelectDestination = (d) => {
    setMiniDestInput(d.term);
    setMiniDestId(d.uid);
    setShowDestSuggestions(false);
  };

  const formatGuestsParam = () => {
    const totalGuestsSingle = adults + children;
    if (rooms <= 1) return String(totalGuestsSingle);
    return Array(rooms).fill(totalGuestsSingle).join('|');
  };

  const handleMiniSearch = async (e) => {
    e.preventDefault();
    let destId = miniDestId;
    if (!destId && destSuggestions.length) {
      destId = destSuggestions[0].uid;
      setMiniDestId(destId);
    }
    if (!destId) return; // require destination
    const activeCheckin = checkinDate;
    const activeCheckout = checkoutDate;
    setLoading(true);
    setShowGuestPicker(false);
    setShowDestSuggestions(false);
    try {
      // Fetch hotels list
      const hotelData = await ApiService.getHotels({ destination_id: destId });
      if (Array.isArray(hotelData)) {
        setHotels(hotelData);
      } else if (hotelData && Array.isArray(hotelData.hotels)) {
        setHotels(hotelData.hotels);
      } else {
        setHotels([]);
      }
      // Build price query with defaults
      const priceQuery = {
        destination_id: destId,
        checkin: activeCheckin,
        checkout: activeCheckout,
        lang: 'en_US',
        currency: 'SGD',
        guests: formatGuestsParam(),
        partner_id: 1089,
        landing_page: 'wl-acme-earn',
        product_type: 'earn'
      };
  await pollPrices(priceQuery);
      // Update display destination name
      const destName = destinations.find(d => d.uid === destId)?.term || displayDestination;
      setDisplayDestination(destName);
      // Commit dates AFTER successful search so UI recalculates nights
      setCommittedCheckin(activeCheckin);
      setCommittedCheckout(activeCheckout);
      setCurrentPage(1);
    } catch (err) {
      console.error('Mini search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const adjustAdults = (delta) => setAdults(a => Math.min(10, Math.max(1, a + delta)));
  const adjustChildren = (delta) => setChildren(c => Math.min(10, Math.max(0, c + delta)));
  const adjustRooms = (delta) => setRooms(r => Math.min(8, Math.max(1, r + delta)));

  // Fetch hotels and poll for prices when destinationId changes
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        // Fetch hotel list from API
        const hotelData = await ApiService.getHotels({ destination_id: destinationId });
        // Normalize hotel data to array
        if (Array.isArray(hotelData)) {
          setHotels(hotelData);
        } else if (hotelData && Array.isArray(hotelData.hotels)) {
          setHotels(hotelData.hotels);
        } else {
          setHotels([]);
        }

        // Prepare price query params
        const priceQuery = {
          destination_id: destinationId,
          checkin: checkin,
          checkout: checkout,
          lang: 'en_US',
          currency: 'SGD',
          guests: guests,
          partner_id: 1089,
          landing_page: 'wl-acme-earn',
          product_type: 'earn'
        };
        // Poll price API until completed or max attempts
        await pollPrices(priceQuery);
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
    return () => { abortPollRef.current = true; };
  }, [destinationId]);

  // Merge price data into hotel objects, only include hotels with price
  // Merge price data into hotel objects, compute per-night price (used for filtering)
  const hotelsWithPrice = hotels
    .map(hotel => {
      const priceObj = prices.find(p => p.id === hotel.id);
      if (!(priceObj && priceObj.price)) return null;
      const nights = getNights(committedCheckin || checkin, committedCheckout || checkout);
      const perNight = nights > 0 ? priceObj.price / nights : priceObj.price; // safeguard
      return { ...hotel, price: priceObj.price, perNight, searchRank: priceObj.searchRank };
    })
    .filter(Boolean);

  // Apply filters and sorting to hotels
  let filteredHotels = hotelsWithPrice.filter(hotel => {
    // Filter by star rating (bucket fractional ratings so 1.5 counts as 1, 2.5 as 2, etc.)
    if (starFilter) {
      const selected = parseInt(starFilter, 10);
      const hotelBucket = Math.floor((hotel.rating || 0));
      if (hotelBucket !== selected) return false;
    }
  // Filter by price range (per-night values as requested)
  if (priceMin && hotel.perNight < parseFloat(priceMin)) return false;
  if (priceMax && hotel.perNight > parseFloat(priceMax)) return false;
    return true;
  });
  // Sort by searchRank descending (default)
  filteredHotels = filteredHotels.sort((a, b) => b.searchRank - a.searchRank);
  // Sort by price if selected
  if (priceSort === 'asc') {
    filteredHotels = filteredHotels.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    filteredHotels = filteredHotels.sort((a, b) => b.price - a.price);
  }
  // Pagination: slice hotels for current page
  const totalPages = Math.ceil(filteredHotels.length / HOTELS_PER_PAGE);
  const paginatedHotels = filteredHotels.slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE);
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const slicedHotels = paginatedHotels.slice(0, 6);

  // Render hotel search results UI
  return (
    <div className="p-10">
      {/* Page heading */}
  <h1 className="text-3xl font-bold mb-6">Hotels in {displayDestination}</h1>
      {/* Mini Search Bar */}
      <form onSubmit={handleMiniSearch} className="mb-8 bg-white/90 border border-gray-200 rounded-2xl shadow p-4 md:p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Destination */}
          <div className="relative md:flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Destination</label>
            <input
              type="text"
              value={miniDestInput}
              onChange={(e)=>{setMiniDestInput(e.target.value); setShowDestSuggestions(true);}}
              onFocus={()=> setShowDestSuggestions(true)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Where to?"
            />
            {showDestSuggestions && destSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-auto">
                {destSuggestions.map(d => (
                  <button type="button" key={d.uid} onClick={()=>handleSelectDestination(d)} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
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
              <input type="date" value={checkinDate} onChange={e=>setCheckinDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
              <input type="date" value={checkoutDate} onChange={e=>setCheckoutDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>
          {/* Guests & Rooms */}
          <div className="relative md:w-56">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Guests & Rooms</label>
            <button type="button" onClick={()=>setShowGuestPicker(o=>!o)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-left flex justify-between items-center hover:border-gray-400">
              <span>{adults+children} guests, {rooms} room{rooms>1?'s':''}</span>
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
                    <button type="button" onClick={()=>adjustRooms(-1)} className="w-6 h-6 flex items-center justify-center border rounded">-</button>
                    <span>{rooms}</span>
                    <button type="button" onClick={()=>adjustRooms(1)} className="w-6 h-6 flex items-center justify-center border rounded">+</button>
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
            <button type="submit" className="w-full h-[42px] md:h-[46px] rounded-lg bg-[#47a6ea] hover:bg-[#3690d4] text-white font-semibold text-sm">Search</button>
          </div>
        </div>
      </form>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 mb-8 md:mb-0 sticky top-8 h-fit">
          {/* Filters heading */}
          <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2"><span className="material-icons align-middle text-blue-400"></span>Filters</h2>
          {/* Star Rating Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-yellow-400"></span>Star Rating
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Star rating buttons */}
              <button
                className={`px-3 py-1 rounded-full border transition ${starFilter === '' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-blue-50'}`}
                onClick={() => setStarFilter('')}
                style={{ minWidth: 60 }}
              >All</button>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  className={`px-3 py-1 rounded-full border flex items-center gap-1 transition ${starFilter === String(star) ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-500 border-gray-300 hover:bg-yellow-100'}`}
                  onClick={() => setStarFilter(String(star))}
                  style={{ minWidth: 60 }}
                >
                  <span className="text-lg" role="img" aria-label="star">⭐</span>{star}
                </button>
              ))}
            </div>
          </div>
          {/* Price Range Filter (per-night) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-green-400"></span>Price Range <span className="text-[11px] font-normal text-gray-500">(per night)</span>
            </label>
            <div className="flex gap-2 items-center">
              {/* Min price input */}
              <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="border border-green-200 rounded px-2 py-1 w-20 focus:ring focus:ring-green-100" placeholder="Min" />
              <span className="text-gray-500">-</span>
              {/* Max price input */}
              <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="border border-green-200 rounded px-2 py-1 w-20 focus:ring focus:ring-green-100" placeholder="Max" />
            </div>
          </div>
          {/* Sort by Price */}
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-purple-400"></span>Sort by Price
            </label>
            <div className="flex gap-2">
              {/* Sort buttons */}
              <button
                className={`px-3 py-1 rounded-full border transition ${priceSort === '' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-blue-50'}`}
                onClick={() => setPriceSort('')}
              >None</button>
              <button
                className={`px-3 py-1 rounded-full border transition ${priceSort === 'asc' ? 'bg-purple-400 text-white border-purple-400' : 'bg-white text-gray-500 border-gray-300 hover:bg-purple-100'}`}
                onClick={() => setPriceSort('asc')}
              >Low to High</button>
              <button
                className={`px-3 py-1 rounded-full border transition ${priceSort === 'desc' ? 'bg-purple-400 text-white border-purple-400' : 'bg-white text-gray-500 border-gray-300 hover:bg-purple-100'}`}
                onClick={() => setPriceSort('desc')}
              >High to Low</button>
            </div>
          </div>
        </aside>
        {/* Hotel Listings */}
        <div className="flex-1">
          {/* Loading and empty states */}
          {loading ? (
            <p>Loading hotels...</p>
          ) : hotels.length === 0 ? (
            <p>No hotels found for this destination.</p>
          ) : (
            <>
              {/* Hotel cards */}
              <div className="flex flex-col gap-8">
                {paginatedHotels.map((hotel, index) => {
                      const nearbyHotels = slicedHotels.filter(h => h.id !== hotel.id);
                  const { name, address, rating, image_details, hires_image_index } = hotel;
                  const priceObj = prices.find(p => p.id === hotel.id);
                  const nights = getNights(committedCheckin || checkin, committedCheckout || checkout);
                  const priceText = `Total $${priceObj.price} for ${nights} night${nights > 1 ? 's' : ''}`;
                  const perNight = priceObj && nights ? (priceObj.price / nights) : null;

                  // Build hotel image URL
                  let imageUrl = 'https://dummyimage.com/400x300/cccccc/000000&text=No+Image';

                  if (
                    image_details?.prefix &&
                    image_details?.suffix
                  ) {
                    let index = '0';

                    if (typeof hires_image_index === 'string' && hires_image_index.trim().length > 0) {
                      const first = hires_image_index.split(',')[0].trim();
                      if (first !== '') {
                        index = first;
                      } else if (typeof hotel.default_image_index === 'number') {
                        index = hotel.default_image_index.toString();
                      }
                    } else if (typeof hotel.default_image_index === 'number') {
                      index = hotel.default_image_index.toString();
                    }

                    imageUrl = `${image_details.prefix}${index}${image_details.suffix}`;
                  }
                      
                  // Render hotel card
                  return (
                        
                    <Link
                      to={`/hotels/${hotel.id}${location.search}`}
                          
                          state={{ nearbyHotels }}
                          onClick={() => console.log("Navigating with hotels:", nearbyHotels)}
                      key={hotel.id || index}
                      className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white flex hover:shadow-xl transition hover:scale-[1.01] w-full">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-64 h-48 object-cover border-r border-gray-300"
                        loading = "lazy"
                      />
                      <div className="p-6 flex w-full justify-between gap-6">
                        <div className="flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold mb-1">{name}</h2>
                            <p className="text-sm text-gray-600 mb-1">{address}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <StarRating rating={rating || 0} />
                            </div>
                            {(priceObj?.free_cancellation || hotel?.free_cancellation) && (
                              <span className="inline-block mt-2 bg-white/70 backdrop-blur-sm text-green-700 text-[10px] md:text-xs font-semibold px-2 py-1 rounded-md border border-green-200">
                                Free cancellation
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-end text-right min-w-[140px]">
                          {perNight !== null && (
                            <div className="text-blue-600 font-bold text-2xl leading-tight">
                              ${perNight.toFixed(0)} <span className="text-sm font-medium">/night</span>
                            </div>
                          )}
                          <div className="text-blue-600 font-semibold text-xs mt-1">{priceText}</div>
                          <button
                            type="button"
                            className="mt-3 w-full px-6 py-3 text-sm md:text-base font-semibold bg-[#47a6ea] hover:bg-[#3690d4] text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                // Pagination buttons and smart ellipsis
                <div className="flex justify-center mt-8 gap-2 flex-wrap">
                  <button
                    className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {/* Smart Pagination: show first, last, current, neighbors, ellipsis */}
                  {(() => {
                    const pageButtons = [];
                    const maxVisible = 5; // max number of numbered buttons to show (excluding first/last/ellipsis)
                    let start = Math.max(2, currentPage - 1);
                    let end = Math.min(totalPages - 1, currentPage + 1);

                    if (currentPage <= 3) {
                      start = 2;
                      end = Math.min(totalPages - 1, 4);
                    } else if (currentPage >= totalPages - 2) {
                      start = Math.max(2, totalPages - 3);
                      end = totalPages - 1;
                    }

                    // Always show first page
                    pageButtons.push(
                      <button
                        key={1}
                        className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    );

                    // Ellipsis if needed before start
                    if (start > 2) {
                      pageButtons.push(
                        <span key="start-ellipsis" className="px-2">...</span>
                      );
                    }

                    // Middle page numbers
                    for (let i = start; i <= end; i++) {
                      pageButtons.push(
                        <button
                          key={i}
                          className={`px-3 py-1 rounded border ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Ellipsis if needed after end
                    if (end < totalPages - 1) {
                      pageButtons.push(
                        <span key="end-ellipsis" className="px-2">...</span>
                      );
                    }

                    // Always show last page if more than 1
                    if (totalPages > 1) {
                      pageButtons.push(
                        <button
                          key={totalPages}
                          className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    return pageButtons;
                  })()}
                  <button
                    className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default HotelSearchResults;
