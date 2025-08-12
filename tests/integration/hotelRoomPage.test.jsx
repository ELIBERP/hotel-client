import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotelDetails from '../../src/pages/HotelDetails';
import { BrowserRouter, Route, Routes } from 'react-router-dom';  // BrowserRouter is needed for routing
import '@testing-library/jest-dom';
import { useLocation, useParams } from 'react-router-dom';  // Import the hooks you want to mock

// Mock the useLocation and useParams hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

// Mock the API service for fetching hotel details and rooms
jest.mock('../../src/services/api', () => ({
  getHotelById: jest.fn().mockResolvedValue({
    id: "diH7",
    imageCount: 167,
    latitude: 1.28624,
    longitude: 103.852889,
    name: "The Fullerton Hotel Singapore",
    address: "1 Fullerton Square",
    address1: "1 Fullerton Square",
    rating: 5,
    description: "Pamper yourself with a visit to the spa...",
    image_details: {
      suffix: ".jpg",
      count: 167,
      prefix: "https://d2ey9sqrvkqdfs.cloudfront.net/diH7/",
    },
    hires_image_index: "0,1,2,3,4,5,6,7,8,9,10",
  }),

  getHotelRoomsByID: jest.fn().mockResolvedValue({
    rooms: [
      {
        key: "0aee658b-239e-57dd-bd2e-a8e3ac0eebf5",
        roomDescription: "Heritage Room Twin",
        converted_price: 5051.62,
        images: [{ url: "https://i.travelapi.com/lodging/1000000/900000/893000/892940/640dedec_b.jpg" }],
        long_description: "<p><strong>2 Twin Beds</strong></p><p>409-sq-foot room with courtyard views</p>",
      }
    ]
  })
}));

const renderHotelDetailsPage = () => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/hotels/:id" element={<HotelDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('HotelDetails Page Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Hotel Details Page Rendering', () => {
    test('should render hotel name and description based on query params', async () => {
      // Mock `useParams` to simulate `id` param from the URL
      useParams.mockReturnValue({ id: "diH7" });

      // Mock `useLocation` to simulate query params
      useLocation.mockReturnValue({
        search: '?destination_id=1&checkin=2025-09-01&checkout=2025-09-05&guests=2&currency=USD&lang=en',
        state: { nearbyHotels: [] },
      });

      renderHotelDetailsPage();

      // Wait for hotel name to be rendered
      await waitFor(() => screen.getByText("The Fullerton Hotel Singapore"));

      // Check if the hotel name and description are rendered correctly
      expect(screen.getByText("The Fullerton Hotel Singapore")).toBeInTheDocument();
      expect(screen.getByText("1 Fullerton Square")).toBeInTheDocument();
      expect(screen.getByText("Pamper yourself with a visit to the spa")).toBeInTheDocument();
    });

    test('should render room descriptions and allow selection', async () => {
      useParams.mockReturnValue({ id: "diH7" });
      useLocation.mockReturnValue({
        search: '?destination_id=1&checkin=2025-09-01&checkout=2025-09-05&guests=2&currency=USD&lang=en',
        state: { nearbyHotels: [] },
      });

      renderHotelDetailsPage();

      // Wait for rooms to load
      await waitFor(() => screen.getByText("Heritage Room Twin"));

      // Check if the room descriptions are displayed
      expect(screen.getByText("Heritage Room Twin")).toBeInTheDocument();

      // Click on the room to select
      const roomButton = screen.getByText('Heritage Room Twin');
      fireEvent.click(roomButton);

      // Ensure the room details modal is opened
      expect(screen.getByText('Book Now')).toBeInTheDocument();
    });
  });

  describe('Booking Room', () => {
    test('should navigate to booking page when "Book Now" is clicked', async () => {
      const navigate = jest.fn();
      renderHotelDetailsPage({ navigate });

      // Wait for "Book Now" button to appear
      await waitFor(() => screen.getByText('Book Now'));

      // Simulate clicking the "Book Now" button
      const bookNowButton = screen.getByText('Book Now');
      fireEvent.click(bookNowButton);

      // Check if the navigate function is called
      expect(navigate).toHaveBeenCalledWith('/booking-form', expect.any(Object));
    });
  });
});
