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

  describe('Search button functionality', () => {
    test('should trigger search when all fields are filled', async () => {
      const mockOnSearch = jest.fn();
      const ApiService = require('../../src/services/api');
      
      // Mock successful API response
      ApiService.getHotels.mockResolvedValue([
        { id: 1, name: 'Test Hotel' }
      ]);

      renderComponent({ onSearch: mockOnSearch });

      // Fill in destination (simulate dropdown selection)
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Singapore' } });
      
      // Fill in check-in date
      const checkinInput = screen.getByDisplayValue('');
      fireEvent.change(checkinInput, { target: { value: '2025-09-10' } });
      
      // Fill in check-out date
      const checkoutInput = screen.getAllByDisplayValue('')[1]; // Second empty input
      fireEvent.change(checkoutInput, { target: { value: '2025-09-13' } });
      
      // Select guests (should have default value of 2)
      const guestsSelect = screen.getByDisplayValue('2 Guests');
      fireEvent.change(guestsSelect, { target: { value: '2' } });

      // Click search button
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      // Verify API was called
      await waitFor(() => {
        expect(ApiService.getHotels).toHaveBeenCalled();
      });

      // Verify onSearch callback was triggered
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    test('should not search when required fields are missing', async () => {
      const mockOnSearch = jest.fn();
      const ApiService = require('../../src/services/api');

      renderComponent({ onSearch: mockOnSearch });

      // Click search button without filling fields
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      // Verify API was NOT called
      expect(ApiService.getHotels).not.toHaveBeenCalled();
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/please select a destination/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation after successful search', () => {
    test('should navigate to /stays page after successful search', async () => {
      const ApiService = require('../../src/services/api');
      
      // Mock successful API response
      const mockResults = [
        { id: 1, name: 'Test Hotel 1' },
        { id: 2, name: 'Test Hotel 2' }
      ];
      ApiService.getHotels.mockResolvedValue(mockResults);

      renderComponent();

      // Fill all required fields
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Singapore' } });
      
      const checkinInput = screen.getByDisplayValue('');
      fireEvent.change(checkinInput, { target: { value: '2025-09-10' } });
      
      const checkoutInput = screen.getAllByDisplayValue('')[1];
      fireEvent.change(checkoutInput, { target: { value: '2025-09-13' } });

      // Click search button
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      // Wait for navigation to be called
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/stays', {
          state: expect.objectContaining({
            searchResults: mockResults,
            hasSearched: true
          })
        });
      });
    });

    test('should not navigate when search fails', async () => {
      const ApiService = require('../../src/services/api');
      
      // Mock API failure
      ApiService.getHotels.mockRejectedValue(new Error('API Error'));

      renderComponent();

      // Fill all required fields
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Singapore' } });
      
      const checkinInput = screen.getByDisplayValue('');
      fireEvent.change(checkinInput, { target: { value: '2025-09-10' } });
      
      const checkoutInput = screen.getAllByDisplayValue('')[1];
      fireEvent.change(checkoutInput, { target: { value: '2025-09-13' } });

      // Click search button
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      // Wait a bit to ensure no navigation occurs
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});