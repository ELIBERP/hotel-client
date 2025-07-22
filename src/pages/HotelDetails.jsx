import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../services/api';
import { SearchBarHotelDetails } from "../components/SearchBarHotelDetails";

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

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
