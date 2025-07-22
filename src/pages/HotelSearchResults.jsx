import React, { useEffect, useState } from 'react';
import destinations from '../assets/destinations.json';
import StarRating from '../components/StarRating';
import { Link, useParams } from 'react-router-dom';

const HotelSearchResults = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { destinationId } = useParams(); // this is the UID, e.g., 'vJh2'
  const [prices, setPrices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const HOTELS_PER_PAGE = 15;

  // find destination term using uid
  const destEntry = destinations.find((d) => d.uid === destinationId);
  const selectedDestination = destEntry?.term || 'Unknown location';

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/hotels?destination_id=${destinationId}`);
        const data = await res.json();
        setHotels(data);
        const priceRes = await fetch(`http://localhost:3000/api/hotels/prices?destination_id=${destinationId}&checkin=2025-10-01&checkout=2025-10-07&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1`);
        const priceData = await priceRes.json();
        console.log('🚨 priceData:', priceData);
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

  // Pagination logic
  const totalPages = Math.ceil(hotels.length / HOTELS_PER_PAGE);
  const paginatedHotels = hotels.slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Hotels in {selectedDestination}</h1>

      {loading ? (
        <p>Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p>No hotels found for this destination.</p>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            {paginatedHotels.map((hotel, index) => { //REPLACED hotel.map with paginatedHotels.map
              const { name, address, rating, image_details, hires_image_index } = hotel;
              const hotelPrice = prices.find(p => p.hotel_id === hotel.id);
              const priceText = hotelPrice ? `From $${hotelPrice.price} / night` : 'Price unavailable';

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
                  to={`/hotels/${hotel.id}`}
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
  );
};

export default HotelSearchResults;
