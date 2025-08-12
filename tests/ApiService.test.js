// tests/ApiService.test.js
import ApiService from '../src/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService Tests', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  describe('Authentication Token Management', () => {
    test('should get auth token from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');
      
      const token = ApiService.getAuthToken();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(token).toBe('mock-jwt-token');
    });

    test('should set auth token in localStorage', () => {
      const testToken = 'test-jwt-token';
      
      ApiService.setAuthToken(testToken);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', testToken);
    });

    test('should check if user is authenticated', () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      
      const isAuthenticated = ApiService.isAuthenticated();
      
      expect(isAuthenticated).toBe(true);
    });

    test('should return false for authentication when no token', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const isAuthenticated = ApiService.isAuthenticated();
      
      expect(isAuthenticated).toBe(false);
    });

    test('should logout and clear localStorage', () => {
      ApiService.logout();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('User Data Management', () => {
    test('should get current user from localStorage', () => {
      const mockUser = {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com'
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const user = ApiService.getCurrentUser();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('userData');
      expect(user).toEqual(mockUser);
    });

    test('should return null when no user data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const user = ApiService.getCurrentUser();
      
      expect(user).toBeNull();
    });

    test('should handle corrupted user data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      const user = ApiService.getCurrentUser();
      
      expect(user).toBeNull();
    });

    test('should set user data in localStorage', () => {
      const userData = {
        token: 'jwt-token',
        user: {
          id: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com'
        }
      };
      
      ApiService.setUserData(userData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', userData.token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(userData.user));
    });
  });

  describe('API Request Methods', () => {
    test('should make authenticated requests with Authorization header', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: 'test' })
      });
      
      await ApiService.makeRequest('/test-endpoint', {
        method: 'GET'
      });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    test('should make requests without Authorization header when not authenticated', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      
      await ApiService.makeRequest('/test-endpoint', {
        method: 'GET'
      });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything()
          })
        })
      );
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(ApiService.makeRequest('/test-endpoint'))
        .rejects
        .toThrow('Network error');
    });

    test('should handle HTTP error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });
      
      await expect(ApiService.makeRequest('/test-endpoint'))
        .rejects
        .toThrow();
    });
  });

  describe('Authentication API Calls', () => {
    test('should register user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'TestPassword123!',
        phoneNumber: '+1234567890'
      };

      const mockResponse = {
        success: true,
        token: 'jwt-token',
        user: {
          id: 'user123',
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ApiService.register(userData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(userData)
        })
      );

      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.token);
    });

    test('should login user successfully', async () => {
      const email = 'john.doe@test.com';
      const password = 'TestPassword123!';

      const mockResponse = {
        success: true,
        token: 'jwt-token',
        user: {
          id: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: email
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ApiService.login(email, password);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ email, password })
        })
      );

      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.token);
    });

    test('should handle login failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Invalid credentials' })
      });

      await expect(ApiService.login('wrong@email.com', 'wrongpassword'))
        .rejects
        .toThrow();
    });
  });

  describe('Booking API Calls', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('valid-jwt-token');
    });

    test('should create booking successfully', async () => {
      const bookingData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phoneNumber: '+1234567890',
        hotelName: 'Test Hotel',
        roomType: 'Deluxe Suite',
        checkInDate: '2024-12-01',
        checkOutDate: '2024-12-03',
        numberOfGuests: 2,
        totalAmount: 500
      };

      const mockResponse = {
        success: true,
        message: 'Booking created successfully',
        booking: {
          id: 'booking_123456789',
          ...bookingData,
          status: 'confirmed'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ApiService.createBooking(bookingData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-jwt-token'
          }),
          body: JSON.stringify(bookingData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should get user bookings successfully', async () => {
      const mockBookings = [
        {
          id: 'booking_1',
          hotelName: 'Hotel A',
          totalAmount: 300,
          status: 'confirmed'
        },
        {
          id: 'booking_2',
          hotelName: 'Hotel B',
          totalAmount: 450,
          status: 'confirmed'
        }
      ];

      const mockResponse = {
        success: true,
        bookings: mockBookings
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ApiService.getUserBookings();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookings'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-jwt-token'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should cancel booking successfully', async () => {
      const bookingId = 'booking_123456789';
      
      const mockResponse = {
        success: true,
        message: 'Booking cancelled successfully'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ApiService.cancelBooking(bookingId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/bookings/${bookingId}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-jwt-token'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should handle booking creation failure', async () => {
      const bookingData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, message: 'Invalid email format' })
      });

      await expect(ApiService.createBooking(bookingData))
        .rejects
        .toThrow();
    });

    test('should handle unauthorized booking requests', async () => {
      mockLocalStorage.getItem.mockReturnValue(null); // No auth token

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      await expect(ApiService.createBooking({}))
        .rejects
        .toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle JSON parsing errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(ApiService.makeRequest('/test-endpoint'))
        .rejects
        .toThrow('Invalid JSON');
    });

    test('should handle 404 errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      await expect(ApiService.makeRequest('/nonexistent-endpoint'))
        .rejects
        .toThrow();
    });

    test('should handle 500 errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      await expect(ApiService.makeRequest('/test-endpoint'))
        .rejects
        .toThrow();
    });
  });
});
