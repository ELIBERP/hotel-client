// pages/BookingSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/env';
import { formatCurrency } from '../utils/pricing';
import ApiService from '../services/api';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');
    
    if (sessionId) {
      // First try to confirm payment and then fetch booking details
      confirmPaymentAndFetchBooking(sessionId, bookingId);
    } else {
      setError('Missing payment session information');
      setLoading(false);
    }
  }, [searchParams]);

  const confirmPaymentAndFetchBooking = async (sessionId, bookingId) => {
    try {
      const authToken = ApiService.getAuthToken();
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      // COMMENTED OUT (API CALL)
      // First, let's try to confirm the payment
      try {
        // const confirmResponse = await fetch(buildApiUrl('/api/bookings/confirm-payment'), {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${authToken}`
        //   },
        //   body: JSON.stringify({ sessionId })
        // });
        
        // Mock response
        const confirmResponse = { ok: true };
        const confirmData = { success: true, bookingId: 'MOCK-' + Math.floor(Math.random() * 10000) };

        if (confirmResponse.ok) {
          console.log('✅ Payment confirmed:', confirmData);
        }
      } catch (confirmError) {
        console.log('Payment may already be processed by webhook:', confirmError.message);
        // Don't fail here - webhook might have already processed it
      }

      // Wait a moment for webhook processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // COMMENTED OUT (API CALL)
      // Now fetch the user's latest bookings to find this payment
      // const bookingsResponse = await fetch(buildApiUrl('/api/bookings'), {
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`
      //   }
      // });

      // if (!bookingsResponse.ok) {
      //   throw new Error('Failed to fetch booking details');
      // }

      // const bookingsData = await bookingsResponse.json();
      
      // Mock response
      const bookingsData = {
        bookings: [
          {
            id: 'MOCK-' + Math.floor(Math.random() * 10000),
            sessionId: sessionId,
            status: 'confirmed',
            hotelName: 'Grand Mock Hotel',
            roomType: 'Deluxe Suite',
            checkInDate: '2025-09-20',
            checkOutDate: '2025-09-23',
            totalAmount: 499.99,
            currency: 'USD',
            guestName: 'Jane Doe',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      if (bookingsData.success && bookingsData.bookings?.length > 0) {
        // Find the most recent booking (likely the one just created)
        const latestBooking = bookingsData.bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        setBookingDetails(latestBooking);
      } else {
        // Fallback to basic confirmation
        setBookingDetails({
          sessionId: sessionId,
          status: 'confirmed',
          message: 'Your booking has been confirmed and saved.'
        });
      }
      
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    // authentication to status update
    try {
      const authToken = ApiService.getAuthToken();
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      // COMMENTED OUT (API CALL)
      // const response = await fetch(buildApiUrl(`/api/bookings/${bookingId}/status`), {
      //   method: 'PATCH',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`
      //   },
      //   body: JSON.stringify({ status })
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to update booking status');
      // }
      
      // Mock successful response
      const response = { ok: true };
    } catch (error) {
      console.error('Error updating booking status:', error);
      // Don't throw here status update failure shouldn't break the success page
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading booking details...</div>
      </div>
    );
  }

  // Show error state when authentication or API calls fail
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-yellow-600 mb-2">Payment Processing Issue</h1>
            <p className="text-gray-600 mb-4">
              Your payment was successful, but we encountered an issue processing your booking details.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Error: {error}
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>
          
          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
              
              {/* Booking Reference Section - Only show this */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Important: Save Your Booking Reference</h4>
                <div className="mb-2">
                  <label className="text-sm font-medium text-blue-700">Booking Reference ID</label>
                  <p className="text-blue-900 font-mono text-lg font-bold">
                    {bookingDetails.id || bookingDetails.sessionId}
                  </p>
                </div>
                <p className="text-blue-700 text-sm">
                  Please copy and save this booking ID. You can use it to find your booking information anytime.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/find-booking')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Find My Booking
            </button>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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
