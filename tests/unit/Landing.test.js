import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import SearchBar_Landing from "../../src/components/SearchBar_Landing";

// Mock the API service
jest.mock('../../src/services/api', () => ({
  getHotels: jest.fn(),
  searchDestinations: jest.fn()
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <SearchBar_Landing {...props} />
    </BrowserRouter>
  );
};

describe('SearchBar_Landing Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all form fields', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText(/where are you going/i)).toBeInTheDocument();
    expect(screen.getByText(/check-in/i)).toBeInTheDocument();
    expect(screen.getByText(/check-out/i)).toBeInTheDocument();
    expect(screen.getByText(/guests/i)).toBeInTheDocument();
    expect(screen.getByText(/search hotels/i)).toBeInTheDocument();
  });

  test('should show validation error when destination is missing', async () => {
    renderComponent();

    const searchButton = screen.getByText(/search hotels/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/please select a destination/i)).toBeInTheDocument();
    });
  });

  test('should show validation error when dates are missing', async () => {
    renderComponent();

    // Fill destination only
    const destinationInput = screen.getByPlaceholderText(/where are you going/i);
    fireEvent.change(destinationInput, { target: { value: 'Singapore' } });

    const searchButton = screen.getByText(/search hotels/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/check-in date is required/i)).toBeInTheDocument();
    });
  });

  test('should call onSearch when all fields are valid', async () => {
    const mockOnSearch = jest.fn();
    renderComponent({ onSearch: mockOnSearch });

    // Fill all fields
    const destinationInput = screen.getByPlaceholderText(/where are you going/i);
    fireEvent.change(destinationInput, { target: { value: 'Singapore' } });
    
    // Assuming your component has data-testid or better selectors
    const checkinInput = screen.getByLabelText(/check-in/i);
    fireEvent.change(checkinInput, { target: { value: '2025-09-10' } });
    
    const checkoutInput = screen.getByLabelText(/check-out/i);
    fireEvent.change(checkoutInput, { target: { value: '2025-09-13' } });

    const searchButton = screen.getByText(/search hotels/i);
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'Singapore',
          checkin: '2025-09-10',
          checkout: '2025-09-13'
        })
      );
    });
  });
});