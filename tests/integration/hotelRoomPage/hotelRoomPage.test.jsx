import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HotelDetails from '../../../src/pages/HotelDetails';
import ApiService from '../../../src/services/api';
import mockHotel from './mockHotel'
import mockHotelRooms from './mockHotelRooms';


vi.mock('../../../src/services/api', () => ({
  default: {
    // Mock the getHotelById method
    getHotelById: vi.fn((id) => {
      // IF valid ID is passed
      if (id === 'validID') { // Use === for strict equality
        return Promise.resolve(mockHotel);
      }
      // IF invalid ID is passed
      else {
        // Use Promise.reject to simulate an API error
        return Promise.reject(new Error('HTTP error! status: 400'));
      }
    }),
    // Mock the getHotelRoomsByID method to accept id and query
    getHotelRoomsByID: vi.fn((id, query) => {
      if (id === 'validID' && query) {
        return Promise.resolve(mockHotelRooms);
      } else {
        return Promise.reject(new Error('Failed to fetch rooms for invalid ID or query'));
      }
    }),
  },
}));


// Add this line to mock react-router-dom
// The component uses useParams, useLocation, and useNavigate
// so we need to mock it to provide test data
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: 'validID' }),
    useLocation: () => ({
      search: '?destination_id=1&checkin=2025-08-15&checkout=2025-08-18&guests=2&currency=USD&lang=en',
      state: { nearbyHotels: [] },
    }),
    useNavigate: () => vi.fn(),
  };
});

describe('HotelDetails Integration', () => {
  it('should display the hotel name after API data is fetched', async () => {
    // Render the component within a BrowserRouter
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    // Wait for the hotel name to appear on the screen
    // This waits for the useEffect hook to complete its API calls
    await waitFor(() => {
      // Find the element that contains the hotel name
      // `getByRole('heading', { level: 1 })` is a good way to find the main heading
      const hotelNameElement = screen.getByRole('heading', { name: /The Inn At Temple Street/i });

      // Assert that the hotel name is in the document
      expect(hotelNameElement).toBeInTheDocument();
    });

    // Optionally, you can also check if the API functions were called
    expect(ApiService.getHotelById).toHaveBeenCalledWith('validID');
    expect(ApiService.getHotelRoomsByID).toHaveBeenCalled();
  });
});
