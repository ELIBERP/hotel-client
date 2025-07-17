import React, { useEffect, useState } from 'react';
import destinations from '../assets/destinations.json';
import StarRating from '../components/StarRating';
import { Link, useParams } from 'react-router-dom';

const HotelSearchResults = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { destinationId } = useParams(); // this is the UID, e.g., 'vJh2'
  const [prices, setPrices] = useState([]);

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

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Hotels in {selectedDestination}</h1>

      {loading ? (
        <p>Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p>No hotels found for this destination.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {hotels.map((hotel, index) => {
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
      )}
    </div>
  );
};

export default HotelSearchResults;
