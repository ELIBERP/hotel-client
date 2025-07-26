import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar_Landing from "../../src/components/SearchBar_Landing.jsx";

// Mock destinations data
jest.mock('../../src/assets/destinations.json', () => [
  { uid: '1', term: 'Singapore', region: 'Asia' },
  { uid: '2', term: 'Bangkok', region: 'Thailand' },
  { uid: '3', term: 'Paris', region: 'France' },
  { uid: '4', term: 'London', region: 'United Kingdom' }
]);

// Mock the API service
jest.mock('../../src/services/api', () => ({
  getHotels: jest.fn().mockResolvedValue([])
}));

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <SearchBar_Landing {...props} />
    </BrowserRouter>
  );
};

describe('SearchBar_Landing Component - Basic UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // === DESTINATION AUTOCOMPLETE ===
  describe('Destination Search', () => {
    test('should show dropdown with destinations when typing', async () => {
      renderComponent();
      
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Sin' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Singapore')).toBeInTheDocument();
      });
    });
  });

  // === GUESTS & ROOMS DROPDOWN ===
  describe('Guests Selection', () => {
    test('should open guests dropdown and change counts', () => {
      renderComponent();
      
      const guestsButton = screen.getByText(/2 guests, 1 room/i);
      fireEvent.click(guestsButton);
      
      expect(screen.getByText('Adults')).toBeInTheDocument();
      
      const adultsPlusButton = screen.getAllByText('+')[0];
      fireEvent.click(adultsPlusButton);
      
      expect(screen.getByText(/3 guests, 1 room/i)).toBeInTheDocument();
    });
  });

  // === SEARCH BUTTON ===
  describe('Search Button', () => {
    test('should show validation error when destination is missing', async () => {
      renderComponent();

      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a destination/i)).toBeInTheDocument();
      });
    });
  });
});
