// pages/BookingSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../config/env';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    
    if (sessionId) {
      fetchBookingDetails(sessionId);
      
      // Update booking status in backend if bookingId is provided
      if (bookingId) {
        updateBookingStatus(bookingId, sessionId);
      }
    }
  }, [searchParams]);

  const fetchBookingDetails = async (sessionId) => {
    try {
      const response = await fetch(buildApiUrl(`/api/payment/booking-details/${sessionId}`));
      const data = await response.json();
      
      if (data.success) {
        setBookingDetails(data.booking);
        // Note: Booking status update is handled separately via updateBookingStatus()
      } else {
        console.error('Failed to fetch booking details:', data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, sessionId) => {
    try {
      // Get JWT token for authenticated request
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, cannot update booking status');
        return;
      }

      // Use the new backend endpoint for payment confirmation
      await fetch(buildApiUrl(`/bookings/${bookingId}/confirm-payment`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId: sessionId,
          paymentIntentId: sessionId // Fallback ID
        })
      });
      
      console.log('✅ Booking payment confirmed successfully');
    } catch (error) {
      console.error('❌ Error confirming booking payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>
          
          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Hotel:</p>
                  <p className="text-gray-900">{bookingDetails.hotelName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Room:</p>
                  <p className="text-gray-900">{bookingDetails.roomType}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Check-in:</p>
                  <p className="text-gray-900">{bookingDetails.checkIn}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Check-out:</p>
                  <p className="text-gray-900">{bookingDetails.checkOut}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Guests:</p>
                  <p className="text-gray-900">{bookingDetails.guests}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Total Paid:</p>
                  <p className="text-gray-900 font-semibold">${bookingDetails.totalAmount}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-700">Payment ID:</p>
                  <p className="text-gray-900 font-mono text-sm">{bookingDetails.paymentIntent}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
