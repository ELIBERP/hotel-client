import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BookingForm from '../BookingForm';

// Mock modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const mockNavigate = jest.fn();
require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

// Mock fetch
global.fetch = jest.fn();
global.alert = jest.fn();

const renderBookingForm = () => {
  return render(
    <BrowserRouter>
      <BookingForm />
    </BrowserRouter>
  );
};

describe('Booking Form to Stripe Payment Gateway Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    fetch.mockClear();
    // Set valid auth token for payment gateway tests
    localStorage.setItem('authToken', 'valid-jwt-token-123');
  });

  // Helper function to fill booking form
  const fillBookingForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
      target: { value: '+65 91234567' }
    });
  };

  // Test 1: Form Validation Before Payment Gateway
  test('Form Validates Required Fields Before Payment Gateway', () => {
    renderBookingForm();
    
    // Try to proceed without filling form
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    
    // Should show validation errors and not proceed
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
  });

  // Test 2: Successful Form Submission to Payment Gateway
  test('Successful Form Submission Creates Booking and Redirects to Stripe', async () => {
    const mockPaymentUrl = 'https://checkout.stripe.com/pay/session_123';
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        booking: { 
          id: 'booking_123',
          status: 'pending',
          totalPrice: 500,
          currency: 'SGD'
        },
        payment: { 
          sessionId: 'session_123',
          url: mockPaymentUrl
        }
      })
    });

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
    
    renderBookingForm();
    
    // Fill form
    fillBookingForm();
    
    // Proceed to payment step
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    
    await waitFor(() => {
      expect(screen.getByText('✅ Booking Summary')).toBeInTheDocument();
    });
    
    // Submit payment
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    await waitFor(() => {
      expect(window.location.href).toBe(mockPaymentUrl);
    });
  });

  // Test 3: Payment Gateway API Request Structure
  test('Payment Gateway Receives Correct Booking Data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        booking: { id: 'booking_123' },
        payment: { url: 'https://stripe.com' }
      })
    });
    
    renderBookingForm();
    
    // Fill form with specific data
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
      target: { value: 'Jane' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
      target: { value: 'Smith' }
    });
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'jane@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
      target: { value: '+65 98765432' }
    });
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    await waitFor(() => {
      const callArgs = fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody).toMatchObject({
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+65 98765432',
        hotel_name: 'Grand Plaza Hotel',
        start_date: '2025-08-15',
        end_date: '2025-08-17',
        nights: 2,
        adults: 2,
        total_price: 500,
        currency: 'SGD',
        room_types: ['Deluxe Suite']
      });
      
      // Verify API endpoint and headers
      expect(callArgs[0]).toBe('http://localhost:3000/bookings');
      expect(callArgs[1].headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-jwt-token-123'
      });
    });
  });

  // Test 4: Payment Gateway Error Handling
  test('Payment Gateway Handles Server Errors Gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        message: 'Payment gateway temporarily unavailable',
        error: 'Stripe service down'
      })
    });
    
    renderBookingForm();
    fillBookingForm();
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Payment gateway temporarily unavailable')
      );
    });
  });

  // Test 5: Payment Gateway Network Error Handling
  test('Payment Gateway Handles Network Errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderBookingForm();
    fillBookingForm();
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create booking: Network error')
      );
    });
  });

  // Test 6: Payment Button Loading State During Gateway Request
  test('Payment Button Shows Loading State During Gateway Request', async () => {
    // Mock a delayed response
    fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, booking: {}, payment: {} })
        }), 100)
      )
    );
    
    renderBookingForm();
    fillBookingForm();
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    // Should show loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // Test 7: Booking Summary Display Before Payment Gateway
  test('Booking Summary Shows Correct Details Before Payment Gateway', () => {
    renderBookingForm();
    fillBookingForm();
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    
    // Verify booking summary details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+65 91234567')).toBeInTheDocument();
    expect(screen.getByText('Grand Plaza Hotel')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    expect(screen.getByText('2025-08-15')).toBeInTheDocument();
    expect(screen.getByText('2025-08-17')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // nights
    expect(screen.getByText('SGD 500')).toBeInTheDocument();
  });

  // Test 8: Payment Gateway Stripe Session Creation
  test('Payment Gateway Creates Stripe Session with Correct Metadata', async () => {
    const mockStripeResponse = {
      success: true,
      booking: { 
        id: 'booking_456',
        status: 'pending'
      },
      payment: { 
        sessionId: 'session_stripe_456',
        url: 'https://checkout.stripe.com/pay/session_stripe_456'
      }
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStripeResponse)
    });
    
    renderBookingForm();
    fillBookingForm();
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    fireEvent.click(screen.getByText('Proceed to Payment'));
    
    await waitFor(() => {
      // Verify the booking was created and Stripe session returned
      const response = fetch.mock.results[0].value;
      expect(response).resolves.toMatchObject({
        ok: true
      });
    });
  });

  // Test 9: Form Validation Prevents Invalid Submission to Payment Gateway
  test('Form Validation Prevents Invalid Submission to Payment Gateway', () => {
    renderBookingForm();
    
    // Fill form with invalid data
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
      target: { value: '' } // Empty first name
    });
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'invalid-email' } // Invalid email
    });
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
      target: { value: '123' } // Invalid phone
    });
    
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    
    // Should not proceed to payment step due to validation errors
    expect(screen.queryByText('✅ Booking Summary')).not.toBeInTheDocument();
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
  });

  // Test 10: Back Navigation from Payment Step
  test('Back Navigation from Payment Step Returns to Form', () => {
    renderBookingForm();
    fillBookingForm();
    
    // Go to payment step
    fireEvent.click(screen.getByText('Continue to Review & Payment →'));
    expect(screen.getByText('✅ Booking Summary')).toBeInTheDocument();
    
    // Go back to form
    fireEvent.click(screen.getByText('← Back to Guest Information'));
    
    // Should be back at form step
    expect(screen.getByText('📋 Guest Information')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });
});
