import { buildApiUrl, getApiEndpoint } from '../config/env.js';
import config from '../config/env.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = buildApiUrl('');
    this.timeout = config.apiTimeout;
  }

  // Generic request method with timeout and better error handling
  async request(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    // Get JWT token from localStorage for authenticated requests
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Add JWT token if available
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

  async getHotels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`${getApiEndpoint('hotels')}?${queryString}`);
  }

  // Make a call to our backend endpoint /hotels/:id to get hotel details
  // Then using the response, render the corresponding images on the frontend
  async getHotelById(id) {
    return this.get(`${getApiEndpoint('hotels')}/${id}`);
  }

  async getHotelRoomsByID(id, query) {
    const queryString = new URLSearchParams(query).toString();
    console.log("hotels/${id}/prices?${queryString}");
    return this.get(`${getApiEndpoint('hotels')}/${id}/prices?${queryString}`);
  }

  // Booking methods - Updated for new backend controller
  async createBooking(bookingData) {
    // Transform frontend booking data to match backend expectations
    const backendBookingData = {
      hotel_id: bookingData.hotelId || bookingData.hotel_id,
      hotel_name: bookingData.hotelName || bookingData.hotel_name,
      start_date: bookingData.checkIn || bookingData.checkInDate || bookingData.start_date,
      end_date: bookingData.checkOut || bookingData.checkOutDate || bookingData.end_date,
      nights: bookingData.nights || bookingData.numberOfNights,
      adults: bookingData.adults || bookingData.numberOfGuests || 1,
      children: bookingData.children || 0,
      first_name: bookingData.firstName || bookingData.first_name,
      last_name: bookingData.lastName || bookingData.last_name,
      total_price: bookingData.totalPrice || bookingData.totalAmount || bookingData.total_price,
      currency: bookingData.currency || 'SGD',
      message_to_hotel: bookingData.specialRequests || bookingData.message_to_hotel,
      room_types: bookingData.roomTypes || [bookingData.roomType] || []
    };
    
    return this.post(getApiEndpoint('bookings'), backendBookingData);
  }

  // Get user's bookings (requires authentication)
  async getUserBookings() {
    return this.get(getApiEndpoint('bookings'));
  }

  // Get specific booking details (requires authentication)
  async getBookingById(bookingId) {
    return this.get(`${getApiEndpoint('bookings')}/${bookingId}`);
  }

  // Confirm payment for booking (requires authentication)
  async confirmBookingPayment(bookingId, paymentData) {
    return this.post(`${getApiEndpoint('bookings')}/${bookingId}/confirm-payment`, paymentData);
  }

  // Authentication methods
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(userData) {
    return this.post('/auth/register', userData);
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
