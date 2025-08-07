import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HotelSearchResults from '../../src/pages/HotelSearchResults';

// mock destinations data
jest.mock('../../src/assets/destinations.json', () => [
  { uid: '1', term: 'Singapore', region: 'Asia' },
  { uid: '2', term: 'Bangkok', region: 'Thailand' }
]);

// mock API service
jest.mock('../../src/services/api', () => ({
  getHotels: jest.fn(),
  getHotelRoomsByID: jest.fn()
}));

const mockHotelData = [
  {
    id: 'hotel1',
    name: 'Sunset Resort',
    address: '123 Beach Rd',
    rating: 4.2,
    image_details: { prefix: 'https://img.com/', suffix: '.jpg' },
    hires_image_index: '0'
  },
  {
    id: 'hotel2',
    name: 'Mountain Lodge',
    address: '456 Hilltop St',
    rating: 3.8,
    image_details: { prefix: 'https://img.com/', suffix: '.jpg' },
    hires_image_index: '1'
  }
];

const mockPriceData = {
  hotels: [
    { hotel_id: 'hotel1', price: 120 },
    { hotel_id: 'hotel2', price: 180 }
  ]
};

const renderComponent = () => {
  const location = {
    pathname: '/search',
    search: '?destination_id=1&search=singapore'
  };

  return render(
    <BrowserRouter location={location}>
      <HotelSearchResults />
    </BrowserRouter>
  );
};

describe('HotelSearchResults Component - Basic UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../src/services/api').getHotels.mockResolvedValue(mockHotelData);
    require('../../src/services/api').getHotelRoomsByID.mockResolvedValue(mockPriceData);
  });

  test('should show loading initially', () => {
    renderComponent();
    expect(screen.getByText(/loading hotels/i)).toBeInTheDocument();
  });

  test('should render hotel cards with name and price', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Sunset Resort')).toBeInTheDocument();
      expect(screen.getByText('From $120 / night')).toBeInTheDocument();
    });

    expect(screen.getByText('Mountain Lodge')).toBeInTheDocument();
    expect(screen.getByText('From $180 / night')).toBeInTheDocument();
  });

  test('should show fallback text if no hotels are found', async () => {
    require('../../src/services/api').getHotels.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no hotels found/i)).toBeInTheDocument();
    });
  });

  test('should render pagination controls when hotel count exceeds limit', async () => {
    const longHotelList = Array.from({ length: 30 }, (_, i) => ({
        id: `hotel${i}`,
        name: `Hotel ${i}`,
        address: `${i} Example St`,
        rating: 4.0,
        image_details: { prefix: 'https://img.com/', suffix: '.jpg' },
        hires_image_index: '0'
    }));

    const longPriceList = {
        hotels: longHotelList.map(h => ({
        hotel_id: h.id,
        price: 100 + parseInt(h.id.replace('hotel', ''), 10)
        }))
    };

    require('../../src/services/api').getHotels.mockResolvedValue(longHotelList);
    require('../../src/services/api').getHotelRoomsByID.mockResolvedValue(longPriceList);

    renderComponent();

    await waitFor(() => {
        expect(screen.getByText('Hotel 0')).toBeInTheDocument();
    });

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    });

});
