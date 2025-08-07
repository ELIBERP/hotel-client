import React, { useEffect, useState } from 'react';
import destinations from '../assets/destinations.json';
import StarRating from '../components/StarRating';
import { Link, useLocation } from 'react-router-dom';
import ApiService from '../services/api';

const HotelSearchResults = () => {
  // Calculate number of nights
  function getNights(checkin, checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = checkoutDate - checkinDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }
  // Filter states
  const [starFilter, setStarFilter] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceSort, setPriceSort] = useState(''); // '' | 'asc' | 'desc'
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const HOTELS_PER_PAGE = 15;
  

  // Get query params from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destinationId = searchParams.get('destination_id') || '';
  const searchQuery = searchParams.get('search') || '';
  const checkin = searchParams.get('checkin') || '2025-10-01';
  const checkout = searchParams.get('checkout') || '2025-10-07';
  const guests = parseInt(searchParams.get('guests'), 10) || 2;

  // find destination term using uid
  const destEntry = destinations.find((d) => d.uid === destinationId);
  const selectedDestination = destEntry?.term || 'Unknown location';

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        // Use ApiService.getHotels for hotel list
        const hotelData = await ApiService.getHotels({ destination_id: destinationId });
        // Ensure hotels is always an array
        if (Array.isArray(hotelData)) {
          setHotels(hotelData);
        } else if (hotelData && Array.isArray(hotelData.hotels)) {
          setHotels(hotelData.hotels);
        } else {
          setHotels([]);
        }

        // Use ApiService.getHotelsPrice for prices, using query params
        const priceQuery = {
          destination_id: destinationId,
          checkin,
          checkout,
          lang: 'en_US',
          currency: 'SGD',
          guests,
          partner_id: 1089,
          landing_page: 'wl-acme-earn',
          product_type: 'earn'
        };
        const priceData = await ApiService.getHotelsPrice(priceQuery);
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

  // Only hotels with price
  // Merge price data into hotel objects for easier filtering
  const hotelsWithPrice = hotels
    .map(hotel => {
      const priceObj = prices.find(p => p.id === hotel.id);
      return priceObj && priceObj.price
        ? { ...hotel, price: priceObj.price, searchRank: priceObj.searchRank }
        : null;
    })
    .filter(Boolean);

  // Apply filters
  let filteredHotels = hotelsWithPrice.filter(hotel => {
    // Star rating filter
    if (starFilter && hotel.rating !== parseInt(starFilter, 10)) return false;
    // Price range filter
    if (priceMin && hotel.price < parseFloat(priceMin)) return false;
    if (priceMax && hotel.price > parseFloat(priceMax)) return false;
    return true;
  });
  // Always sort by searchRank descending first
  filteredHotels = filteredHotels.sort((a, b) => b.searchRank - a.searchRank);
  // Then sort by price if selected
  if (priceSort === 'asc') {
    filteredHotels = filteredHotels.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    filteredHotels = filteredHotels.sort((a, b) => b.price - a.price);
  }
  // Pagination logic
  const totalPages = Math.ceil(filteredHotels.length / HOTELS_PER_PAGE);
  const paginatedHotels = filteredHotels.slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE);
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const slicedHotels = paginatedHotels.slice(0, 6);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Hotels in {selectedDestination}</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 mb-8 md:mb-0 sticky top-8 h-fit">
          <h2 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2"><span className="material-icons align-middle text-blue-400"></span>Filters</h2>
          {/* Star Rating Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-yellow-400"></span>Star Rating
            </label>
            <div className="flex flex-wrap gap-2">
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
              <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="border border-green-200 rounded px-2 py-1 w-20 focus:ring focus:ring-green-100" placeholder="Min" />
              <span className="text-gray-500">-</span>
              <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="border border-green-200 rounded px-2 py-1 w-20 focus:ring focus:ring-green-100" placeholder="Max" />
            </div>
          </div>
          {/* Sort by Price */}
          <div className="mb-2">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span className="material-icons text-purple-400"></span>Sort by Price
            </label>
            <div className="flex gap-2">
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
              {loading ? (
                <p>Loading hotels...</p>
              ) : hotels.length === 0 ? (
                <p>No hotels found for this destination.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-8">
                    {paginatedHotels.map((hotel, index) => {
                      const nearbyHotels = slicedHotels.filter(h => h.id !== hotel.id);
                      const { name, address, rating, image_details, hires_image_index } = hotel;
                      const priceObj = prices.find(p => p.id === hotel.id);
                      const nights = getNights(checkin, checkout);
                      const priceText = `From $${priceObj.price} for ${nights} night${nights > 1 ? 's' : ''}`;

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
                      
                      return (
                        
                        <Link
                          to={`/hotels/${hotel.id}${location.search}`}
                          
                          state={{ nearbyHotels }}
                          onClick={() => console.log("Navigating with hotels:", nearbyHotels)}
                          key={hotel.id || index}
                          className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white flex hover:shadow-xl transition hover:scale-[1.01]">
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-64 h-48 object-cover border-r border-gray-300"
                            loading = "lazy"
                          />
                          <div className="p-6 flex flex-col justify-between">
                            <div>
                              <h2 className="text-2xl font-semibold mb-1">{name}</h2>
                              <p className="text-sm text-gray-600 mb-1">{address}</p>
                              <div className="flex items-center gap-1 text-sm">
                                <StarRating rating={rating || 0} />
                              </div>
                            </div>
                            <p className="text-blue-600 font-semibold mt-3 text-base">{priceText}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    //added flex-wrap
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
