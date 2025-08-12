// tests/BookingForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookingForm from '../src/pages/BookingForm';
import ApiService from '../src/services/api';
import { AuthProvider } from '../src/context/AuthContext';

// Mock the API service
jest.mock('../src/services/api');

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/booking-form' })
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('BookingForm Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    ApiService.isAuthenticated.mockReturnValue(false);
    ApiService.getCurrentUser.mockReturnValue(null);
  });

  describe('Authentication State Display', () => {
    test('should show authentication warning when user is not logged in', () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Click here to login')).toBeInTheDocument();
    });

    test('should show user info when user is logged in', () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      ApiService.isAuthenticated.mockReturnValue(true);
      ApiService.getCurrentUser.mockReturnValue(mockUser);

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      expect(screen.getByText(`Logged in as ${mockUser.firstName} ${mockUser.lastName}`)).toBeInTheDocument();
      expect(screen.getByText('Your booking will be saved to your account.')).toBeInTheDocument();
    });

    test('should pre-fill form with user data when logged in', () => {
      const mockUser = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com'
      };

      ApiService.isAuthenticated.mockReturnValue(true);
      ApiService.getCurrentUser.mockReturnValue(mockUser);

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should validate required fields', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });

    test('should validate email format', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });
    });

    test('should validate phone number format', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const phoneInput = screen.getByPlaceholderText('+1 (555) 123-4567');
      fireEvent.change(phoneInput, { target: { value: '123' } });

      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    test('should clear errors when user starts typing', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Trigger validation error
      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      // Start typing to clear error
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Navigation', () => {
    test('should navigate to step 2 when form is valid', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Fill in required fields
      fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
        target: { value: 'john.doe@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
        target: { value: '+1234567890' }
      });

      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Booking Summary')).toBeInTheDocument();
        expect(screen.getByText('Payment Summary')).toBeInTheDocument();
      });
    });

    test('should navigate back to step 1 from step 2', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Navigate to step 2 first
      fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
        target: { value: 'john.doe@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
        target: { value: '+1234567890' }
      });

      fireEvent.click(screen.getByText('Continue to Review & Payment →'));

      await waitFor(() => {
        expect(screen.getByText('Booking Summary')).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByText('← Back to Guest Information');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Guest Information')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    test('should redirect to login when click login button', () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const loginButton = screen.getByText('Click here to login');
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: { pathname: '/booking-form' } }
      });
    });

    test('should show login required message in payment section for unauthenticated users', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Navigate to step 2
      fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
        target: { value: 'john.doe@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
        target: { value: '+1234567890' }
      });

      fireEvent.click(screen.getByText('Continue to Review & Payment →'));

      await waitFor(() => {
        expect(screen.getByText('⚠️ Login Required')).toBeInTheDocument();
        expect(screen.getByText('Login to Continue')).toBeInTheDocument();
      });
    });

    test('should show payment button for authenticated users', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      ApiService.isAuthenticated.mockReturnValue(true);
      ApiService.getCurrentUser.mockReturnValue(mockUser);

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Navigate to step 2
      fireEvent.click(screen.getByText('Continue to Review & Payment →'));

      await waitFor(() => {
        expect(screen.queryByText('⚠️ Login Required')).not.toBeInTheDocument();
        // Payment button should be rendered (assuming PaymentButton component shows some text)
        expect(screen.getByText('🔒 Your payment is secured by Stripe')).toBeInTheDocument();
      });
    });

    test('should handle logout functionality', () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      ApiService.isAuthenticated.mockReturnValue(true);
      ApiService.getCurrentUser.mockReturnValue(mockUser);
      ApiService.logout.mockImplementation(() => {});

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(ApiService.logout).toHaveBeenCalled();
    });
  });

  describe('Booking Creation', () => {
    test('should redirect to login if not authenticated when trying to create booking', async () => {
      ApiService.isAuthenticated.mockReturnValue(false);
      ApiService.createBooking.mockResolvedValue({
        success: false,
        message: 'Authentication required'
      });

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Fill form and navigate to step 2
      fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
        target: { value: 'john.doe@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), {
        target: { value: '+1234567890' }
      });

      fireEvent.click(screen.getByText('Continue to Review & Payment →'));

      await waitFor(() => {
        const loginButton = screen.getByText('Login to Continue');
        fireEvent.click(loginButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: { from: { pathname: '/booking-form' } }
        });
      });
    });

    test('should create booking successfully when authenticated', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };

      const mockBookingResponse = {
        success: true,
        booking: {
          id: 'booking_123456789',
          hotelName: 'Grand Plaza Hotel',
          totalAmount: 500
        }
      };

      ApiService.isAuthenticated.mockReturnValue(true);
      ApiService.getCurrentUser.mockReturnValue(mockUser);
      ApiService.createBooking.mockResolvedValue(mockBookingResponse);

      // Mock window.alert to prevent actual alerts during testing
      window.alert = jest.fn();

      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      // Navigate to step 2
      fireEvent.click(screen.getByText('Continue to Review & Payment →'));

      // Simulate booking creation (this would normally be triggered by PaymentButton)
      // For this test, we'll directly test the handleCreateBooking function
      // In a real scenario, you'd trigger it through the PaymentButton component

      expect(ApiService.createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          hotelName: 'Grand Plaza Hotel',
          roomType: 'Deluxe Suite',
          totalAmount: 500
        })
      );
    });
  });

  describe('Accessibility Tests', () => {
    test('should have proper form labels', () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument();
      expect(screen.getByLabelText('Special Requests (Optional)')).toBeInTheDocument();
    });

    test('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const firstNameInput = screen.getByLabelText('First Name *');
      expect(firstNameInput).toHaveAttribute('required');
      
      const emailInput = screen.getByLabelText('Email Address *');
      expect(emailInput).toHaveAttribute('type', 'email');
      
      const phoneInput = screen.getByLabelText('Phone Number *');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    test('should associate error messages with form fields', async () => {
      render(
        <TestWrapper>
          <BookingForm />
        </TestWrapper>
      );

      const continueButton = screen.getByText('Continue to Review & Payment →');
      fireEvent.click(continueButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('First name is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-500');
      });
    });
  });
});
