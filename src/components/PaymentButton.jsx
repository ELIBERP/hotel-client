// components/PaymentButton.jsx
import React, { useState } from 'react';
import { buildApiUrl } from '../config/env';
import { convertFromSGD } from '../utils/currency';

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
      // If there's a pre-payment callback (like creating the booking), call it first
      if (onBeforePayment) {
        await onBeforePayment();
      }

      const apiUrl = buildApiUrl('/api/bookings/create-payment-session');
      console.log('🔍 API URL being called:', apiUrl);
      
      // Convert SGD amount to target currency for Stripe
      const currency = bookingData.currency || 'SGD';
      const convertedAmount = currency === 'SGD' 
        ? bookingData.totalAmount 
        : convertFromSGD(bookingData.totalAmount, currency);
      
      console.log(`💱 Currency conversion: SGD ${bookingData.totalAmount} → ${currency} ${convertedAmount}`);
      
      const requestData = {
        hotelName: bookingData.hotelName,
        roomType: bookingData.roomType,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: bookingData.numberOfGuests,
        pricePerNight: bookingData.pricePerNight,
        numberOfNights: bookingData.numberOfNights,
        totalAmount: convertedAmount, // Use CONVERTED amount for Stripe
        bookingId: bookingData.bookingId || bookingData.id,
        currency: currency.toLowerCase(), // Pass currency to backend
      };
      
      console.log('📤 Request data:', requestData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📨 Response status:', response.status);

      const data = await response.json();
      console.log('📨 Response data:', data);
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe Checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
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
        `💳 Proceed to Payment`
      )}
    </button>
  );
};

export default PaymentButton;
