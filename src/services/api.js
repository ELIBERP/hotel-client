import { buildApiUrl, getApiEndpoint } from '../config/env.js';
import config from '../config/env.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = buildApiUrl('');
    this.timeout = config.apiTimeout;
  }

  // Get JWT token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set JWT token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store user data after login/register
  setUserData(userData) {
    localStorage.setItem('user', JSON.stringify(userData.user));
    // Store JWT token if it exists
    if (userData.token) {
      this.setAuthToken(userData.token);
    }
  }

  // Remove JWT token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Logout user
  logout() {
    this.removeAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    return Promise.resolve(); // Return a resolved promise for consistency
  }

  // Generic request method with timeout, JWT auth, and better error handling
  async request(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    // Add JWT token to headers if available
    const authToken = this.getAuthToken();
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout), // Built-in timeout
    };

    try {
      if (config.debugMode) {
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
      }

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData || 'Request failed'}`);
      }
      
      const data = await response.json();
      
      if (config.debugMode) {
        console.log('API Response:', data);
      }
      
      return data;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.error('API request timed out:', url);
        throw new Error('Request timed out. Please try again.');
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Specific API methods
  async searchHotels(query) {
    return this.get(`${getApiEndpoint('search')}?q=${encodeURIComponent(query)}`);
  }

  // endpoint 3.2
  async getHotels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`${getApiEndpoint('hotels')}?${queryString}`);
  }

  async getHotelsPrice(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`${getApiEndpoint('hotels')}/prices?${queryString}`);
  }

  // Make a call to our backend endpoint /hotels/:id to get hotel details
  // endpoint 3.4
  // Then using the response, render the corresponding images on the frontend
  async getHotelById(id) {
    return this.get(`${getApiEndpoint('hotels')}/${id}`);
  }

  // endpoint 3.3
  async getHotelRoomsByID(id, query) {
    const queryString = new URLSearchParams(query).toString();
    console.log("hotels/${id}/prices?${queryString}");
    return this.get(`${getApiEndpoint('hotels')}/${id}/prices?${queryString}`);
  }

  

  // Booking methods (Protected routes - require JWT authentication)
  async createBooking(bookingData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to create a booking');
      }

      // Send bookingData 
      const response = await this.request('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData), 
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.token) {
        this.setAuthToken(response.token);
        this.setUserData(response);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getUserBookings() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to view bookings');
      }

      const response = await this.request('/bookings', {
        method: 'GET',
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to cancel booking');
      }

      const response = await this.request(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  // Payment methods
  async createCheckoutSession(bookingData) {
    return this.post('/api/payment/create-checkout-session', bookingData);
  }

  async getBookingDetails(sessionId) {
    return this.get(`/api/payment/booking-details/${sessionId}`);
  }

  async updateBookingStatus(bookingId, status) {
    return this.put(`${getApiEndpoint('bookings')}/${bookingId}/status`, { status });
  }
}

export default new ApiService();
