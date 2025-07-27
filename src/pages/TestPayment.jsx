// pages/TestPayment.jsx
import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { calculateNights, calculateTotalPrice, formatCurrency } from '../utils/pricing';

const TestPayment = () => {
  const [bookingData] = useState({
    hotelName: 'Grand Test Hotel',
    roomType: 'Deluxe Suite',
    checkInDate: '2024-03-15',
    checkOutDate: '2024-03-17',
    numberOfGuests: 2,
    pricePerNight: 150,
    numberOfNights: 2,
    totalAmount: 300,
    id: 'test_booking_123'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Stripe Payment Test
          </h1>
          
          {/* Test Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Test Information</h2>
            <div className="space-y-2 text-blue-700">
              <p>🏨 <strong>Hotel:</strong> {bookingData.hotelName}</p>
              <p>🛏️ <strong>Room:</strong> {bookingData.roomType}</p>
              <p>📅 <strong>Check-in:</strong> {bookingData.checkInDate}</p>
              <p>📅 <strong>Check-out:</strong> {bookingData.checkOutDate}</p>
              <p>👥 <strong>Guests:</strong> {bookingData.numberOfGuests}</p>
              <p>🌙 <strong>Nights:</strong> {bookingData.numberOfNights}</p>
              <p>💰 <strong>Price per night:</strong> {formatCurrency(bookingData.pricePerNight)}</p>
              <p>💳 <strong>Total Amount:</strong> {formatCurrency(bookingData.totalAmount)}</p>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">📋 Test Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-yellow-700">
              <li>Click the "Pay" button below</li>
              <li>You'll be redirected to Stripe Checkout</li>
              <li>Use test card: <code className="bg-white px-2 py-1 rounded">4242 4242 4242 4242</code></li>
              <li>Use any future expiry date (like 12/34)</li>
              <li>Use any 3-digit CVC (like 123)</li>
              <li>Complete the payment to test success flow</li>
            </ol>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <PaymentButton bookingData={bookingData} />
            
            <div className="text-center text-sm text-gray-500">
              <p>🔒 This is a test payment using Stripe test mode</p>
              <p>No real money will be charged</p>
            </div>
          </div>

          {/* Test Results */}
          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-800">✅ Expected Test Results</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Payment succeeds → Redirect to <code>/booking-success</code></li>
              <li>• Payment cancelled → Redirect to <code>/booking-cancel</code></li>
              <li>• Success page shows booking details</li>
              <li>• Check browser network tab for API calls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;
