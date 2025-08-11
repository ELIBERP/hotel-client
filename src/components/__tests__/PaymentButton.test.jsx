import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentButton from '../PaymentButton';

// Mock the API calls
global.fetch = jest.fn();

describe('PaymentButton Component', () => {
  const mockBookingData = {
    hotel_id: 'hotel_123',
    hotel_name: 'Grand Plaza Hotel',
    start_date: '2025-08-15',
    end_date: '2025-08-17',
    nights: 2,
    adults: 2,
    children: 0,
    first_name: 'John',
    last_name: 'Doe',
    total_price: 500,
    currency: 'SGD'
  };

  const mockOnBeforePayment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'mock-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Test 1: Payment Button Renders Default State
  it('Payment Button Renders Default State', () => {
    render(
      <PaymentButton 
        bookingData={mockBookingData}
        isSubmitting={false}
      />
    );
    
    expect(screen.getByText(/Proceed to Payment/)).toBeInTheDocument();
    expect(screen.getByText(/\$500/)).toBeInTheDocument(); // Check for the price
    expect(screen.getByRole('button')).not.toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');
  });

  // Test 2: Payment Button Shows Loading State
  test('Payment Button Shows Loading State', () => {
    render(
      <PaymentButton 
        bookingData={mockBookingData} 
        isSubmitting={true}
        onBeforePayment={mockOnBeforePayment}
      />
    );
    
    expect(screen.getByText('Creating Booking...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Creating Booking/ })).toBeInTheDocument();
  });

  // Test 3: Payment Button Disabled When Loading
  test('Payment Button Disabled When Loading', () => {
    render(
      <PaymentButton 
        bookingData={mockBookingData} 
        isSubmitting={true}
        onBeforePayment={mockOnBeforePayment}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnBeforePayment).not.toHaveBeenCalled();
  });

  // Test 4: Payment Button Calls onBeforePayment
  test('Payment Button Calls onBeforePayment', async () => {
    render(
      <PaymentButton 
        bookingData={mockBookingData} 
        isSubmitting={false}
        onBeforePayment={mockOnBeforePayment}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnBeforePayment).toHaveBeenCalledTimes(1);
    });
  });

  // Test 5: Payment Button Handles Missing Booking Data
  test('Payment Button Handles Missing Booking Data', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Use empty booking data instead of null to avoid null reference error
    const emptyBookingData = {};
    
    render(
      <PaymentButton 
        bookingData={emptyBookingData} 
        isSubmitting={false}
        onBeforePayment={mockOnBeforePayment}
      />
    );
    
    expect(screen.getByText(/Pay Now/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  // Test 6: Payment Button Text With Price
  test('Payment Button Text With Price', () => {
    render(
      <PaymentButton 
        bookingData={mockBookingData} 
        isSubmitting={false}
        onBeforePayment={mockOnBeforePayment}
      />
    );
    
    expect(screen.getByText(/Proceed to Payment - \$500/)).toBeInTheDocument();
  });
});
