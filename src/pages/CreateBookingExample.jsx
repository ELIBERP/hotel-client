// pages/CreateBooking.jsx (Updated with Stripe integration example)
import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { calculateNights, calculateTotalPrice, validateBookingData, formatCurrency } from '../utils/pricing';

const CreateBooking = () => {
  const [bookingData, setBookingData] = useState({
    hotelName: 'Sample Hotel',
    roomType: 'Deluxe Room',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 2,
    pricePerNight: 150,
    numberOfNights: 1,
    totalAmount: 150,
    id: Math.random().toString(36).substr(2, 9) // Generate random booking ID
  });

  const [errors, setErrors] = useState([]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...bookingData, [field]: value };
    
    // Recalculate nights and total when dates change
    if (field === 'checkInDate' || field === 'checkOutDate') {
      if (updatedData.checkInDate && updatedData.checkOutDate) {
        const nights = calculateNights(updatedData.checkInDate, updatedData.checkOutDate);
        const total = calculateTotalPrice(updatedData.pricePerNight, nights, updatedData.numberOfGuests);
        updatedData.numberOfNights = nights;
        updatedData.totalAmount = total;
      }
    }
    
    // Recalculate total when guests change
    if (field === 'numberOfGuests') {
      const total = calculateTotalPrice(updatedData.pricePerNight, updatedData.numberOfNights, value);
      updatedData.totalAmount = total;
    }
    
    setBookingData(updatedData);
    
    // Clear errors when user makes changes
    if (errors.length > 0) {
      const validation = validateBookingData(updatedData);
      setErrors(validation.errors);
    }
  };

  const handleBooking = () => {
    const validation = validateBookingData(bookingData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    // PaymentButton will handle the payment process
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>
          
          {/* Booking Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Hotel:</span> {bookingData.hotelName}</p>
              <p><span className="font-medium">Room:</span> {bookingData.roomType}</p>
              <p><span className="font-medium">Price per night:</span> {formatCurrency(bookingData.pricePerNight)}</p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={bookingData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={bookingData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <select
                value={bookingData.numberOfGuests}
                onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
              {bookingData.numberOfGuests > 2 && (
                <p className="text-sm text-gray-600 mt-1">
                  Additional fee: $25 per extra guest per night
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{formatCurrency(bookingData.pricePerNight)} × {bookingData.numberOfNights} night{bookingData.numberOfNights > 1 ? 's' : ''}</span>
                  <span>{formatCurrency(bookingData.pricePerNight * bookingData.numberOfNights)}</span>
                </div>
                {bookingData.numberOfGuests > 2 && (
                  <div className="flex justify-between">
                    <span>Extra guest fees</span>
                    <span>{formatCurrency((bookingData.numberOfGuests - 2) * 25 * bookingData.numberOfNights)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(bookingData.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="text-red-600 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payment Button */}
            <div className="border-t pt-6">
              <PaymentButton bookingData={bookingData} />
              <p className="text-xs text-gray-500 text-center mt-2">
                You will be redirected to Stripe's secure payment page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
