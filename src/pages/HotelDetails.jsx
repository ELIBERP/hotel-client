import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../services/api';

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    ApiService.getHotelById(id)
      .then((data) => {
        setHotel(data);

        const { prefix, suffix } = data.image_details;
        const indices = data.hires_image_index
          .split(',')
          .map((str) => str.trim())
          .filter((str) => str !== ''); // Just in case there are empty strings

        const imageUrls = indices.map((index) => `${prefix}${index}${suffix}`);

        setImages(imageUrls);
      })
      .catch((err) => console.error(err));
  }, [id]);


  if (!hotel) return <div>Loading...</div>;

  return (
    <div>
      <h1>{hotel.name}</h1>

      <h2>Static Photos </h2>
      <div style={{ display: 'flex', overflowX: 'scroll' }}>
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={`Hotel image ${idx}`} width={200} />
        ))}
      </div>

        
    </div>
  );
};

export default HotelDetails;
