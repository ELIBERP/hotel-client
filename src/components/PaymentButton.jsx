// components/PaymentButton.jsx
import React, { useState } from 'react';
import { buildApiUrl } from '../config/env';
import { convertFromSGD } from '../utils/currency';
import ApiService from '../services/api';

const PaymentButton = ({ bookingData, isSubmitting, onBeforePayment }) => {
  const [loading, setLoading] = useState(false);

  // Calculate converted amount for display
  const currency = bookingData.currency || 'SGD';
  const convertedAmount = currency === 'SGD' 
    ? bookingData.totalAmount 
    : convertFromSGD(bookingData.totalAmount, currency);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // 🔧 FIX: Removed onBeforePayment call to prevent duplicate booking creation
      // The booking will only be created after successful payment via webhook
      
      const apiUrl = buildApiUrl('/api/bookings/create-payment-session');
      console.log('API URL being called:', apiUrl);
      
      // Convert SGD amount to target currency for Stripe
      const currency = bookingData.currency || 'SGD';
      const convertedAmount = currency === 'SGD' 
        ? bookingData.totalAmount 
        : convertFromSGD(bookingData.totalAmount, currency);
      
      console.log(`Currency conversion: SGD ${bookingData.totalAmount} → ${currency} ${convertedAmount}`);
      
      // Debug: Check if we have a valid JWT token before making the request
      const authToken = ApiService.getAuthToken();
      // console.log('Auth token check before payment:', {
      //   hasToken: !!authToken,
      //   tokenLength: authToken ? authToken.length : 0,
      //   tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'null'
      // });
      
      if (!authToken) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const requestData = {
        // Backend expects these exact field names
        hotel_id: bookingData.hotelId,
        hotel_name: bookingData.hotelName,
        room_type: bookingData.roomType,
        start_date: bookingData.checkInDate,
        end_date: bookingData.checkOutDate,
        nights: bookingData.numberOfNights,
        adults: bookingData.numberOfGuests,
        children: 0,
        total_price: convertedAmount, 
        currency: currency.toLowerCase(), 
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        phone: bookingData.phoneNumber,
        special_requests: bookingData.specialRequests || ''
      };
      
      console.log('Request data:', requestData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ApiService.getAuthToken()}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.payment_url) {
        console.log('Redirecting to Stripe Checkout:', data.payment_url);
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.message || data.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || isSubmitting;

  return (
    <button 
      onClick={handlePayment} 
      disabled={isDisabled}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
    >
      {loading || isSubmitting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {isSubmitting ? 'Creating Booking...' : 'Processing...'}
        </>
      ) : (
        `Proceed to Payment`
      )}
    </button>
  );
};

export default PaymentButton;
