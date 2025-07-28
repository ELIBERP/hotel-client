// pages/BookingForm.jsx
import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { validateBookingData, formatCurrency } from '../utils/pricing';

const BookingForm = () => {
  const [step, setStep] = useState(1); // 1: Guest Info, 2: Review & Payment
  const [formData, setFormData] = useState({
    // Guest Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialRequests: '',
    
    // Booking Details (pre-filled or from URL params)
    hotelName: 'Grand Plaza Hotel',
    roomType: 'Deluxe Suite',
    checkInDate: '2024-04-01',
    checkOutDate: '2024-04-03',
    numberOfGuests: 2,
    numberOfNights: 2,
    pricePerNight: 250,
    totalAmount: 500, // This will be the specified price
    
    // Generated booking ID
    bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateGuestInfo = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateGuestInfo()) {
      setStep(2);
    }
  };

  const handleCreateBooking = async () => {
    setIsSubmitting(true);
    try {
      // Call your booking API to store guest information
      const bookingResponse = await fetch(buildApiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: formData.bookingId,
          guestInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            specialRequests: formData.specialRequests
          },
          bookingDetails: {
            hotelName: formData.hotelName,
            roomType: formData.roomType,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            numberOfGuests: formData.numberOfGuests,
            numberOfNights: formData.numberOfNights,
            totalAmount: formData.totalAmount
          },
          status: 'pending_payment'
        })
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      console.log('✅ Booking created successfully');
      // The PaymentButton will handle the payment process
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGuestInfoStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📋 Guest Information</h2>
        <p className="text-blue-600">Please provide your details for the booking</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={formData.specialRequests}
          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any special requests or requirements for your stay..."
        />
        <p className="text-sm text-gray-500 mt-1">
          Examples: Late check-in, room preferences, dietary requirements, etc.
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Continue to Review & Payment →
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-green-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">✅ Booking Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Guest Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phoneNumber}</p>
              {formData.specialRequests && (
                <p><strong>Special Requests:</strong> {formData.specialRequests}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Hotel:</strong> {formData.hotelName}</p>
              <p><strong>Room:</strong> {formData.roomType}</p>
              <p><strong>Check-in:</strong> {formData.checkInDate}</p>
              <p><strong>Check-out:</strong> {formData.checkOutDate}</p>
              <p><strong>Guests:</strong> {formData.numberOfGuests}</p>
              <p><strong>Nights:</strong> {formData.numberOfNights}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💰 Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-lg">
            <span>Room Rate ({formData.numberOfNights} nights)</span>
            <span>{formatCurrency(formData.pricePerNight * formData.numberOfNights)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxes & Fees</span>
            <span>Included</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-xl font-bold text-green-600">
            <span>Total Amount</span>
            <span>{formatCurrency(formData.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-yellow-800">💳 Payment</h3>
        <p className="text-yellow-700 mb-4">
          Click "Proceed to Payment" to complete your booking securely with Stripe.
          You'll be redirected to a secure payment page.
        </p>
        
        <div className="space-y-4">
          <PaymentButton 
            bookingData={formData} 
            isSubmitting={isSubmitting}
            onBeforePayment={handleCreateBooking}
          />
          
          <p className="text-xs text-gray-500 text-center">
            🔒 Your payment is secured by Stripe. No card details are stored on our servers.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => setStep(1)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          ← Back to Guest Information
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏨 Complete Your Booking
            </h1>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2">Guest Info</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2">Review & Pay</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          {step === 1 ? renderGuestInfoStep() : renderReviewStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
