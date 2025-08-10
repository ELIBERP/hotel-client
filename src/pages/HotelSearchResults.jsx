// React and dependencies
import React, { useEffect, useState } from 'react';
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
        let priceData = await ApiService.getHotelsPrice(priceQuery);
        let pollCount = 0;
        while (priceData && priceData.completed !== true && pollCount < 20) {
          await new Promise(res => setTimeout(res, 1000));
          priceData = await ApiService.getHotelsPrice(priceQuery);
          pollCount++;
        }
        // Set prices from API response
        setPrices(priceData.hotels || []);
      } catch (err) {
        console.error('Failed to fetch hotels:', err);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [destinationId]);

  // Merge price data into hotel objects, only include hotels with price
  const hotelsWithPrice = hotels
    .map(hotel => {
      const priceObj = prices.find(p => p.id === hotel.id);
      return priceObj && priceObj.price
        ? { ...hotel, price: priceObj.price, searchRank: priceObj.searchRank }
        : null;
    })
    .filter(Boolean);

  // Apply filters and sorting to hotels
  let filteredHotels = hotelsWithPrice.filter(hotel => {
    // Filter by star rating
    if (starFilter && hotel.rating !== parseInt(starFilter, 10)) return false;
    // Filter by price range
    if (priceMin && hotel.price < parseFloat(priceMin)) return false;
    if (priceMax && hotel.price > parseFloat(priceMax)) return false;
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

  // Handle pagination button click
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render hotel search results UI
  return (
    <div className="p-10">
      {/* Page heading */}
      <h1 className="text-3xl font-bold mb-6">Hotels in {selectedDestination}</h1>
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
          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-green-400"></span>Price Range
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
                  const { name, address, rating, image_details, hires_image_index } = hotel;
                  const priceObj = prices.find(p => p.id === hotel.id);
                  const nights = getNights(checkin, checkout);
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
                      to={`/hotels/${hotel.id}`}
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
