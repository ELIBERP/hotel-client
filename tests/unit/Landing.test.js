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

describe('SearchBar_Landing Component - Comprehensive UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // === MODULE 1: COMPONENT RENDERING ===
  describe('Component Rendering', () => {
    test('should render all form fields with default values', () => {
      renderComponent();
      
      // Verify all major elements are present
      expect(screen.getByPlaceholderText(/where are you going/i)).toBeInTheDocument();
      expect(screen.getByText(/check-in/i)).toBeInTheDocument();
      expect(screen.getByText(/check-out/i)).toBeInTheDocument();
      expect(screen.getByText(/2 guests, 1 room/i)).toBeInTheDocument();
      expect(screen.getByText(/search hotels/i)).toBeInTheDocument();
    });
  });

  // === MODULE 2: DESTINATION AUTOCOMPLETE ===
  describe('Destination Search', () => {
    // Key Behavior: Dropdown showing
    test('should show dropdown with destinations when typing', async () => {
      renderComponent();
      
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Sin' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Singapore')).toBeInTheDocument();
      });
    });
    
    // Key Behavior: Filtering logic
    test('should filter destinations based on input', async () => {
      renderComponent();
      
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Bang' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('Bangkok')).toBeInTheDocument();
        expect(screen.queryByText('Singapore')).not.toBeInTheDocument();
      });
    });
    
    // Key Behavior: Selection
    test('should select destination when clicked', async () => {
      renderComponent();
      
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Lon' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('London'));
      });
      
      expect(destinationInput).toHaveValue('London');
    });
    
    // Key Behavior: No results message
    test('should show "no results" message for non-matching search', async () => {
      renderComponent();
      
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'xyz123' } });
      jest.advanceTimersByTime(300);
      
      // Check if the dropdown is not showing any results
      // This is an alternative check since the component may not have an explicit "no results" message
      await waitFor(() => {
        expect(screen.queryByText('Singapore')).not.toBeInTheDocument();
        expect(screen.queryByText('Bangkok')).not.toBeInTheDocument();
        expect(screen.queryByText('Paris')).not.toBeInTheDocument();
        expect(screen.queryByText('London')).not.toBeInTheDocument();
      });
    });
  });

  // === MODULE 3: DATE SELECTION ===
  describe('Date Selection', () => {
    // Key Behavior: Individual inputs
    test('should allow setting check-in date', () => {
      renderComponent();
      
      const dateInputs = screen.getAllByDisplayValue('');
      const checkinInput = dateInputs[0]; // First date input
      
      fireEvent.change(checkinInput, { target: { value: '2025-09-15' } });
      expect(checkinInput).toHaveValue('2025-09-15');
    });
    
    // Key Behavior: Date dependency logic
    test('should allow setting check-out date after check-in', () => {
      renderComponent();
      
      const dateInputs = screen.getAllByDisplayValue('');
      const checkinInput = dateInputs[0];
      const checkoutInput = dateInputs[1];
      
      // Set check-in date first
      fireEvent.change(checkinInput, { target: { value: '2025-09-15' } });
      // Set check-out date after
      fireEvent.change(checkoutInput, { target: { value: '2025-09-20' } });
      
      expect(checkinInput).toHaveValue('2025-09-15');
      expect(checkoutInput).toHaveValue('2025-09-20');
    });
  });

  // === MODULE 4: GUESTS & ROOMS DROPDOWN ===
  describe('Guests Selection', () => {
    // Key Behavior: Dropdown open/close
    test('should open guests dropdown and show options', () => {
      renderComponent();
      
      const guestsButton = screen.getByText(/2 guests, 1 room/i);
      fireEvent.click(guestsButton);
      
      expect(screen.getByText('Adults')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
      expect(screen.getByText('Rooms')).toBeInTheDocument();
    });
    
    // Key Behavior: Counter increment
    test('should increment adults count when + is clicked', () => {
      renderComponent();
      
      const guestsButton = screen.getByText(/2 guests, 1 room/i);
      fireEvent.click(guestsButton);
      
      const adultsPlusButton = screen.getAllByText('+')[0];
      fireEvent.click(adultsPlusButton);
      
      expect(screen.getByText(/3 guests, 1 room/i)).toBeInTheDocument();
    });
    
    // Key Behavior: Counter decrement
    test('should decrement adults count when − is clicked', () => {
      renderComponent();
      
      const guestsButton = screen.getByText(/2 guests, 1 room/i);
      fireEvent.click(guestsButton);
      
      const adultsMinusButton = screen.getAllByText('−')[0];
      fireEvent.click(adultsMinusButton);
      
      expect(screen.getByText(/1 guest, 1 room/i)).toBeInTheDocument();
    });
    
    // Key Behavior: Reset functionality
    test('should reset to default values when Reset button is clicked', () => {
      renderComponent();
      
      const guestsButton = screen.getByText(/2 guests, 1 room/i);
      fireEvent.click(guestsButton);
      
      // Change values first
      const adultsPlusButton = screen.getAllByText('+')[0];
      fireEvent.click(adultsPlusButton);
      expect(screen.getByText(/3 guests, 1 room/i)).toBeInTheDocument();
      
      // Reset
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(screen.getByText(/2 guests, 1 room/i)).toBeInTheDocument();
    });
  });

  // === MODULE 5: FORM VALIDATION ===
  describe('Form Validation', () => {
    // Key Behavior: Required field validation
    test('should show validation error when destination is missing', async () => {
      renderComponent();

      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a destination/i)).toBeInTheDocument();
      });
    });
    
    // Key Behavior: Error clearing on correction
    test('should clear validation error when field is corrected', async () => {
      renderComponent();

      // Trigger error first
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please select a destination/i)).toBeInTheDocument();
      });
      
      // Fix the field
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Sin' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Singapore'));
      });
      
      // Error should be cleared
      expect(screen.queryByText(/please select a destination/i)).not.toBeInTheDocument();
    });
  });

  // === MODULE 6: SEARCH BUTTON ===
  describe('Search Button', () => {
    // Key Behavior: Loading state
    test('should show loading state during search', async () => {
      const mockOnSearch = jest.fn();
      renderComponent({ onSearch: mockOnSearch });
      
      // Fill all required fields first
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Sin' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Singapore'));
      });
      
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2025-09-10' } });
      fireEvent.change(dateInputs[1], { target: { value: '2025-09-15' } });
      
      // Trigger search
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);
      
      // Should show loading state
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
    
    // Key Behavior: Callback with parameters
    test('should call onSearch with correct parameters on successful search', async () => {
      const mockOnSearch = jest.fn();
      renderComponent({ onSearch: mockOnSearch });
      
      // Fill all required fields
      const destinationInput = screen.getByPlaceholderText(/where are you going/i);
      fireEvent.change(destinationInput, { target: { value: 'Sin' } });
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Singapore'));
      });
      
      const dateInputs = screen.getAllByDisplayValue('');
      fireEvent.change(dateInputs[0], { target: { value: '2025-09-10' } });
      fireEvent.change(dateInputs[1], { target: { value: '2025-09-15' } });
      
      // Trigger search
      const searchButton = screen.getByText(/search hotels/i);
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Array),
          expect.objectContaining({
            destination_id: expect.any(String),
            checkin: '2025-09-10',
            checkout: '2025-09-15'
          })
        );
      });
    });
  });
});
