// pages/FindBooking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/pricing';

const FindBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check URL for booking reference on component mount
  useEffect(() => {
    const bookingReference = searchParams.get('booking_reference');
    if (bookingReference) {
      setBookingId(bookingReference);
      // Auto search if reference is in URL
      handleSearch(null, bookingReference);
    }
  }, [searchParams]);

  const handleSearch = async (e, referenceFromUrl) => {
    if (e) e.preventDefault();
    
    const searchId = referenceFromUrl || bookingId;
    
    if (!searchId.trim()) {
      setError('Please enter a booking reference ID');
      return;
    }

    setLoading(true);
    setError('');
    setBookingData(null);

    try {
      // COMMENTED OUT (API CALL)
      // const response = await ApiService.get(`/api/public/bookings/find/${bookingId.trim()}`);
      
      // Mock response data
      const response = {
        success: true,
        data: {
          bookingId: searchId.trim(),
          hotelName: 'Mock Grand Hotel',
          roomType: 'Deluxe Suite',
          checkInDate: '2025-09-15',
          checkOutDate: '2025-09-18',
          guestName: 'John Doe',
          totalAmount: 599.00,
          currency: 'USD',
          status: 'confirmed'
        }
      };
      
      if (response.success && response.data) {
        setBookingData(response.data);
      } else {
        setError('Booking not found. Please check your booking reference ID.');
      }
    } catch (err) {
      console.error('Error searching for booking:', err);
      if (err.response?.status === 404) {
        setError('Booking not found. Please check your booking reference ID.');
      } else {
        setError('Unable to search for booking. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBookingDetails = (booking) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Information</h2>
      
      {/* Booking Reference Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-blue-700">Booking Reference ID</label>
            <p className="text-blue-900 font-mono text-lg font-bold">{booking.id}</p>
          </div>
          <div className="text-right">
            <label className="text-sm font-medium text-blue-700">Status</label>
            <p className={`font-semibold text-lg capitalize ${
              booking.booking_status === 'confirmed' ? 'text-green-600' : 
              booking.booking_status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {booking.booking_status || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Description & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="text-gray-900">Hotel Booking Confirmation</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Destination ID</label>
          <p className="text-gray-900">{booking.hotel_id || '-'}</p>
        </div>
      </div>

      {/* Hotel ID */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-500">Hotel ID</label>
        <p className="text-gray-900">{booking.hotel_id || '-'}</p>
      </div>

      {/* Booking Display Information */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Booking Display Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Number of Nights</label>
            <p className="text-gray-900">{booking.nights || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Start Date</label>
            <p className="text-gray-900">
              {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">End Date</label>
            <p className="text-gray-900">
              {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Adults</label>
            <p className="text-gray-900">{booking.adults || 1}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Children</label>
            <p className="text-gray-900">{booking.children || 0}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Room Types</label>
            <p className="text-gray-900">
              {booking.room_types 
                ? (Array.isArray(booking.room_types) 
                    ? booking.room_types.join(', ')
                    : booking.room_types)
                : 'Standard Room'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-500">Message to Hotel</label>
          <p className="text-gray-900">{booking.special_requests || 'No special requests'}</p>
        </div>
      </div>

      {/* Price Information */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Price</h3>
        <div className="bg-green-50 rounded-lg p-4">
          <label className="text-sm font-medium text-green-700">Total Price Paid</label>
          <p className="text-green-800 text-2xl font-bold">
            {formatCurrency(booking.total_price, booking.currency)}
          </p>
        </div>
      </div>

      {/* Guest Information */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Guest Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Salutation</label>
            <p className="text-gray-900">{booking.title || 'Mr/Ms'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">First Name</label>
            <p className="text-gray-900">{booking.first_name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Name</label>
            <p className="text-gray-900">{booking.last_name || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{booking.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{booking.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Payee Information */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-lg mb-4">Payee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Payment ID</label>
            <p className="text-gray-900 font-mono text-sm">
              {booking.payment_reference || 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Payee ID</label>
            <p className="text-gray-900">{booking.email || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Booking</h1>
            <p className="text-gray-600">Enter your booking reference ID to view your booking details</p>
          </div>
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Reference ID
                </label>
                <input
                  type="text"
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g., e13d733a-7404-49a6-b8c0-c3b9a3cd8ddf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div className="sm:self-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  {loading ? 'Searching...' : 'Find Booking'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {bookingData && renderBookingDetails(bookingData)}
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindBooking;
