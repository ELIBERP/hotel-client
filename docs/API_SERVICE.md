# API Service Documentation 🔌

The `api.js` service provides a centralized way to communicate with the backend server. It handles all HTTP requests, error handling, timeouts, and response parsing.

## 📁 Location
```
src/services/api.js
```

## 🏗️ Architecture

The API service is built as a singleton class that provides:
- **Centralized Configuration** - Uses environment variables for base URL and settings
- **Error Handling** - Consistent error handling across all requests
- **Timeout Management** - Configurable request timeouts
- **Debug Logging** - Optional request/response logging for development

## 🚀 Quick Start

### Basic Import
```javascript
import ApiService from '../services/api';
```

### Making API Calls
```javascript
// In your component
const MyComponent = () => {
  const handleSearch = async () => {
    try {
      const hotels = await ApiService.getHotels({ destination_id: 'NYC' });
      console.log('Hotels found:', hotels);
    } catch (error) {
      console.error('Search failed:', error.message);
    }
  };
};
```

## 📚 Available Methods

### Generic HTTP Methods

#### `get(endpoint)`
```javascript
// GET request
const data = await ApiService.get('/hotels');
const hotel = await ApiService.get('/hotels/123');
```

#### `post(endpoint, data)`
```javascript
// POST request
const newBooking = await ApiService.post('/bookings', {
  hotel_id: '123',
  check_in: '2024-07-01',
  check_out: '2024-07-03'
});
```

#### `put(endpoint, data)`
```javascript
// PUT request (update)
const updatedBooking = await ApiService.put('/bookings/456', {
  check_out: '2024-07-04'
});
```

#### `delete(endpoint)`
```javascript
// DELETE request
await ApiService.delete('/bookings/456');
```

### Specialized Hotel Methods

#### `getHotels(params)`
Search and retrieve hotels with optional query parameters.

```javascript
// Basic hotel search
const hotels = await ApiService.getHotels();

// Search with filters
const filteredHotels = await ApiService.getHotels({
  destination_id: 'WD0M',
  checkin: '2024-07-01',
  checkout: '2024-07-03',
  guests: 2
});

// URL generated: GET /hotels?destination_id=WD0M&checkin=2024-07-01&checkout=2024-07-03&guests=2
```

**Parameters:**
- `destination_id` (string) - Destination identifier
- `checkin` (string) - Check-in date (YYYY-MM-DD)
- `checkout` (string) - Check-out date (YYYY-MM-DD) 
- `guests` (number) - Number of guests
- `price_min` (number) - Minimum price filter
- `price_max` (number) - Maximum price filter

#### `getHotelById(id)`
Get detailed information for a specific hotel.

```javascript
const hotel = await ApiService.getHotelById('hotel-123');
```

#### `searchHotels(query)`
Text-based hotel search (legacy method).

```javascript
const results = await ApiService.searchHotels('Paris hotels');
```

#### `createBooking(bookingData)`
Create a new hotel booking.

```javascript
const booking = await ApiService.createBooking({
  hotel_id: 'hotel-123',
  guest_name: 'John Doe',
  email: 'john@example.com',
  check_in: '2024-07-01',
  check_out: '2024-07-03',
  guests: 2,
  room_type: 'deluxe'
});
```

## ⚙️ Configuration

### Environment Variables
The API service uses these environment variables:

```bash
# Required: Backend API base URL
VITE_API_BASE_URL=http://localhost:3000/

# Optional: Request timeout in milliseconds (default: 10000)
VITE_API_TIMEOUT=15000

# Optional: Enable debug logging (default: false)
VITE_DEBUG_MODE=true
```

### API Endpoints Configuration
Default endpoints are defined in `src/config/env.js`:

```javascript
endpoints: {
  auth: '/auth',
  hotels: '/hotels',
  bookings: '/bookings', 
  search: '/search',
  user: '/user'
}
```

## 🛠️ Error Handling

### Automatic Error Handling
The API service automatically handles:

```javascript
try {
  const data = await ApiService.getHotels();
} catch (error) {
  // Error types you might encounter:
  
  if (error.message.includes('timed out')) {
    // Request timeout (configurable via VITE_API_TIMEOUT)
    console.log('Request took too long');
  } else if (error.message.includes('HTTP 404')) {
    // Not found
    console.log('Resource not found');
  } else if (error.message.includes('HTTP 500')) {
    // Server error
    console.log('Server error occurred');
  } else {
    // Network or other errors
    console.log('Network error:', error.message);
  }
}
```

### Error Response Format
API errors include:
- **HTTP Status Code** - Standard HTTP status codes
- **Error Message** - Descriptive error message
- **Response Body** - Server error details (when available)

## 🔍 Debug Mode

Enable debug mode to see all API requests and responses:

```bash
# In your .env.local file
VITE_DEBUG_MODE=true
```

When enabled, you'll see console logs like:
```
API Request: GET http://localhost:3000/api/hotels?destination_id=WD0M
API Response: { hotels: [...], total: 25 }
```

## 📝 Usage Examples

### In React Components

#### Search Bar Component
```javascript
import React, { useState } from 'react';
import ApiService from '../services/api';

const SearchBar = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await ApiService.getHotels({ 
        destination_id: searchValue.trim() 
      });
      
      onSearch(searchValue, results);
    } catch (error) {
      console.error('Search failed:', error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search destination..."
      />
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};
```

#### Hotel Details Component
```javascript
import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const HotelDetails = ({ hotelId }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotelData = await ApiService.getHotelById(hotelId);
        setHotel(hotelData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotel();
    }
  }, [hotelId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hotel) return <div>Hotel not found</div>;

  return (
    <div>
      <h1>{hotel.name}</h1>
      <p>{hotel.description}</p>
      <p>Price: ${hotel.price}/night</p>
    </div>
  );
};
```

#### Booking Form Component
```javascript
import React, { useState } from 'react';
import ApiService from '../services/api';

const BookingForm = ({ hotelId }) => {
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    check_in: '',
    check_out: '',
    guests: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const booking = await ApiService.createBooking({
        hotel_id: hotelId,
        ...formData
      });
      
      console.log('Booking created:', booking);
      // Redirect to confirmation page
    } catch (error) {
      console.error('Booking failed:', error);
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Booking...' : 'Book Now'}
      </button>
    </form>
  );
};
```

## 🔧 Advanced Usage

### Custom Headers
```javascript
// Add custom headers to a request
const data = await ApiService.request('/hotels', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Custom-Header': 'value'
  }
});
```

### Custom Timeout
```javascript
// Override default timeout for specific request
const data = await ApiService.request('/slow-endpoint', {
  method: 'GET',
  signal: AbortSignal.timeout(30000) // 30 seconds
});
```

## 🚨 Common Issues

### CORS Errors
```
Access to fetch at 'http://localhost:3000/hotels' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution**: Ensure your backend server has CORS configured to allow requests from your frontend origin.

### Network Errors
```
TypeError: Failed to fetch
```

**Solutions**:
1. Check if backend server is running
2. Verify `VITE_API_BASE_URL` is correct
3. Check network connectivity

### Timeout Errors
```
Request timed out. Please try again.
```

**Solutions**:
1. Increase `VITE_API_TIMEOUT` in environment variables
2. Optimize backend response time
3. Check network speed

## 🎯 Best Practices

1. **Always Handle Errors**: Wrap API calls in try-catch blocks
2. **Show Loading States**: Use loading indicators for better UX
3. **Use Specific Methods**: Prefer `getHotels()` over generic `get()`
4. **Environment Variables**: Never hardcode API URLs
5. **Debug Mode**: Enable in development, disable in production
6. **Error Messages**: Show user-friendly error messages
7. **Timeout Handling**: Set appropriate timeouts for your use case

## 🔗 Related Documentation

- [Environment Variables Guide](../docs/ENVIRONMENT_VARIABLES.md) - API configuration
- [Main README](../README.md) - Project setup and overview
- [Backend API Documentation](link-to-backend-docs) - Server-side API reference

---

**Need help?** Check the main [README.md](../README.md) for troubleshooting or contact the development team.
