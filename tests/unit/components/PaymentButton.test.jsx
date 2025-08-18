// PaymentButton.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaymentButton from '../../../src/components/PaymentButton';

// Mock environment configuration
jest.mock('../../../src/config/env', () => ({
  buildApiUrl: jest.fn((path) => `http://localhost:3000${path}`)
}));

// Mock API service
jest.mock('../../../src/services/api', () => ({
  default: {
    getAuthToken: jest.fn(() => 'mock-token')
  }
}));

const mockBookingData = {
  hotelId: 'hotel123',
  hotelName: 'Test Hotel',
  roomType: 'Deluxe Room',
  checkInDate: '2024-01-15',
  checkOutDate: '2024-01-17',
  numberOfNights: 2,
  numberOfGuests: 2,
  totalAmount: 200,
  currency: 'SGD',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+65 12345678',
  specialRequests: 'Late check-in'
};

const renderPaymentButton = (bookingData = mockBookingData, isSubmitting = false) => {
  return render(
    <MemoryRouter>
      <PaymentButton bookingData={bookingData} isSubmitting={isSubmitting} />
    </MemoryRouter>
  );
};

describe('PaymentButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });

  describe('Rendering', () => {
    test('renders payment button with correct text', () => {
      renderPaymentButton();

      const button = screen.getByRole('button', { name: /proceed to payment/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-green-600');
    });

    test('shows loading state when isSubmitting is true', () => {
      renderPaymentButton(mockBookingData, true);

      expect(screen.getByText('Creating Booking...')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('has correct CSS classes for styling', () => {
      renderPaymentButton();

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full', 'bg-green-600', 'hover:bg-green-700', 'text-white');
    });
  });

  describe('State Management', () => {
    test('button is enabled when not submitting', () => {
      renderPaymentButton(mockBookingData, false);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    test('button is disabled when submitting', () => {
      renderPaymentButton(mockBookingData, true);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
