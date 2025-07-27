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
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
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

  async createBooking(bookingData) {
    return this.post(getApiEndpoint('bookings'), bookingData);
  }

  // Authentication methods
  async register(userData) {
    return this.post('auth/register', userData);
  }

  async login(credentials) {
    return this.post('auth/login', credentials);
  }

  async logout() {
    // Clear local storage and make logout request if needed
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authenticated');
    return Promise.resolve();
  }

  // Check if user is authenticated
  isAuthenticated() {
    const user = localStorage.getItem('user');
    return user !== null;
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Store user data after login/register
  setUserData(userData) {
    localStorage.setItem('user', JSON.stringify(userData.user));
    // Only store token if it exists (backend doesn't currently send tokens)
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    } else {
      // Store a simple flag to indicate authenticated session
      localStorage.setItem('authenticated', 'true');
    }
  }
}

export default new ApiService();
