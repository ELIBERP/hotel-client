import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HotelDetails from '../../../src/pages/HotelDetails';
import ApiService from '../../../src/services/api';
import mockHotel from './mockHotel'
import mockHotelRooms from './mockHotelRooms';
import mockNoHotelRooms from './mockNoHotelRooms';


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
        return Promise.resolve(mockNoHotelRooms);
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
  // ====== 1. Hotel Name Display Test ========== //
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

  // ====== 2. Display Skeleton ========== //
  it('should display skeleton loaders while fetching data', () => {
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    const headerSkeleton = screen.getByTestId('hotel-header-skeleton');
    const roomGridSkeleton = screen.getByTestId('room-grid-skeleton');

    expect(headerSkeleton).toBeInTheDocument();
    expect(roomGridSkeleton).toBeInTheDocument();
  });

  // ====== 3. Correct API service called ========== //
  it('should call the API services with correct parameters on initial render', async () => {
    // Render the component
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    // Wait for API calls to complete
    await new Promise(process.nextTick);

    // Assert that the API functions were called with the correct parameters
    expect(ApiService.getHotelById).toHaveBeenCalledWith('validID');
    expect(ApiService.getHotelRoomsByID).toHaveBeenCalledWith('validID', {
      destination_id: '1',
      checkin: '2025-08-15',
      checkout: '2025-08-18',
      guests: '2',
      currency: 'USD',
      country_code: 'SG',
      lang: 'en',
      partner_id: 1,
    });
  });

  // ====== 4. Main Image and Gallery Images Test ========== //
  it('should display the main hotel image and gallery images', async () => {
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    // Wait for the main image to appear
    await waitFor(() => {
      const mainImage = screen.getByAltText('Main Hotel View');
      expect(mainImage).toBeInTheDocument();
      // Verify the src matches the first image in mockHotel (image_details + hires_image_index)
      const expectedMainSrc = `${mockHotel.image_details.prefix}${mockHotel.hires_image_index.split(',')[0].trim()}${mockHotel.image_details.suffix}`;
      expect(mainImage).toHaveAttribute('src', expectedMainSrc);
    });

    // Check for gallery images (assuming there are some in mockHotel)
    // You might need a more specific query if multiple images have similar alt text
    const galleryImages = screen.getAllByAltText(/Hotel image \d+/i);
    expect(galleryImages.length).toBeGreaterThan(0);
    // You can further assert that the src of some gallery images matches your mock
  });

  // ====== 5. Hotel Amenities Test ========== //
  it('should display hotel amenities', async () => {
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for the "Hotel Amenities" heading
      const amenitiesHeading = screen.getByRole('heading', { name: /Hotel Amenities/i });
      expect(amenitiesHeading).toBeInTheDocument();

      // Check for a few expected amenity chips based on mockHotel.amenities
      expect(screen.getByLabelText('Hotel amenities').textContent).toContain('Air conditioning');
      expect(screen.getByLabelText('Hotel amenities').textContent).toContain('Dry Cleaning');
    });
  });

  // ====== 6. Room Grid and Filter Buttons Test ========== //
  it('should display room grid and filter buttons when rooms are available', async () => {
    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for "Choose your room" heading
      const chooseRoomHeading = screen.getByRole('heading', { name: /Choose your room/i });
      expect(chooseRoomHeading).toBeInTheDocument();

      // Check for filter buttons
      expect(screen.getByRole('button', { name: /All Rooms/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1 Bed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2 Beds/i })).toBeInTheDocument();

      // Check that room cards are rendered (e.g., by finding a room description from the mock)
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument();

      const roomDescriptions = screen.getAllByText(/Room/i);
      expect(roomDescriptions.length).toBeGreaterThan(0); // Ensure at least some rooms are displayed
    });
  });
  
  // ====== 7. Invalid Hotel ID ========== //
  it('should not display hotel name when API call fails due to invalid ID', async () => {
    // Override the mock to simulate an invalid ID for this test.
    vi.doMock('react-router-dom', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        useParams: () => ({ id: 'invalidID' }),
        useLocation: () => ({
          search: '?destination_id=1&checkin=2025-08-15&checkout=2025-08-18&guests=2&currency=USD&lang=en',
          state: { nearbyHotels: [] },
        }),
        useNavigate: () => vi.fn(),
      };
    });
    
    // Dynamically import the component after setting up the specific mock
    const { default: HotelDetails } = await import('../../../src/pages/HotelDetails');

    render(
      <BrowserRouter>
        <HotelDetails />
      </BrowserRouter>
    );

    // Wait for the API call to fail and the component to re-render.
    // The queryBy... methods are used here because they return null if the element isn't found,
    // which is what we expect in this error case.
    await waitFor(() => {
      const hotelNameElement = screen.queryByRole('heading', { name: /The Inn At Temple Street/i });
      expect(hotelNameElement).not.toBeInTheDocument();
    });
  });
});

