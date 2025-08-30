// pages/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentButton from '../components/PaymentButton';
import { validateBookingData, formatCurrency } from '../utils/pricing';
import { SUPPORTED_CURRENCIES, convertFromSGD, getExchangeDisplay, formatCurrencyWithSymbol } from '../utils/currency';
import ApiService from '../services/api';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [step, setStep] = useState(1); // 1: Guest Info, 2: Review & Payment
  // Get hotel details from navigation state immediately
  const hotelDetails = location.state?.hotelDetails;
  console.log('BookingForm initializing with hotelDetails:', hotelDetails);
  
  const [formData, setFormData] = useState({
    // Guest Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialRequests: '',
    
    // Booking Details - populated from hotel details navigation state
    hotelId: hotelDetails?.id || 'hotel_id_1234', 
    hotelName: hotelDetails?.name || 'Grandeus Hotel',
    roomType: hotelDetails?.room || 'Deluxe Suite',
    checkInDate: hotelDetails?.checkIn || '2026-10-01',
    checkOutDate: hotelDetails?.checkOut || '2026-10-05',
    numberOfGuests: hotelDetails?.guests || 3,
    numberOfNights: hotelDetails?.nights || 5,
    pricePerNight: hotelDetails?.price && hotelDetails?.nights ? hotelDetails.price / hotelDetails.nights : 0,
    totalAmount: hotelDetails?.price || 4300,
    currency: hotelDetails?.currency || 'SGD',
    
    // Generated booking ID
    bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication status and pre-fill form with user data
  useEffect(() => {
    if (isAuthenticated() && user) {
      console.log('User is authenticated:', user);
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email
      }));
    } else {
      console.log('User not authenticated, token check:', {
        hasToken: !!ApiService.getAuthToken(),
        hasUser: !!user,
        isAuth: isAuthenticated()
      });
    }
  }, [user, isAuthenticated]); 

  // Populate form with hotel details from navigation state
  useEffect(() => {
    const hd = location.state?.hotelDetails; // { id, name, room, checkIn, checkOut, guests, nights, price, currency? }
    if (!hd) return;

    setFormData(prev => ({
      ...prev,
      hotelId: hd.id ?? prev.hotelId,
      hotelName: hd.name ?? prev.hotelName,
      roomType: hd.room ?? prev.roomType,
      checkInDate: hd.checkIn ?? prev.checkInDate,
      checkOutDate: hd.checkOut ?? prev.checkOutDate,
      numberOfGuests: Number(hd.guests ?? prev.numberOfGuests),
      numberOfNights: Number(hd.nights ?? prev.numberOfNights),
      totalAmount: Number(hd.price ?? prev.totalAmount),
      // optional
      pricePerNight: hd.price && hd.nights ? Number(hd.price) / Number(hd.nights) : prev.pricePerNight,
      currency: hd.currency || 'SGD', 
    }));
  }, [location.state?.hotelDetails]); 

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
      // COMMENTED OUT (API CALL)
      // Check if user is authenticated
      const token = ApiService.getAuthToken();
      const authCheck = isAuthenticated();
      
      console.log('Pre-booking auth check:', {
        hasToken: !!token,
        tokenValue: token ? `${token.substring(0, 20)}...` : 'null',
        hasUser: !!user,
        isAuthenticated: authCheck
      });
      
      if (!authCheck || !token) {
        alert('Please login to create a booking. Redirecting to login page...');
        navigate('/login', { state: { from: location } });
        return;
      }

      // Ky: Don't create booking here, let payment session handle it
      console.log('✅ Auth check passed, ready for payment session creation');
      
      // The PaymentButton will handle the payment session and booking creation
      setStep(2); // Allow user to proceed to payment step

    } catch (error) {
      console.error('❌ Error in booking preparation:', error);
      
      if (error.message.includes('login') || error.message.includes('401')) {
        alert('Your session has expired. Please login again.');
        navigate('/login', { state: { from: location } });
      } else {
        alert(`Failed to prepare booking: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGuestInfoStep = () => (
    <div className="space-y-6">
      {/* User Info Display - Only show if logged in */}
      {isAuthenticated() && user && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-green-400">✅</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Logged in as {user.firstName} {user.lastName}
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Your booking will be saved to your account.
                <button 
                  onClick={async () => {
                    try {
                      await logout(navigate);
                      console.log('User logged out successfully');
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                  className="font-medium underline hover:text-green-900 ml-2"
                >
                  Logout
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Guest Information</h2>
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

      {/* Currency Selection */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">💳 Payment Currency</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Select your preferred currency for payment. Base price: {formatCurrency(formData.totalAmount, 'SGD')}
          {formData.currency !== 'SGD' && (
            <span className="font-semibold"> → {getExchangeDisplay(formData.totalAmount, formData.currency)}</span>
          )}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Payment Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CURRENCIES.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.name} ({curr.code})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            💡 <strong>Note:</strong> Stripe will charge you the converted amount in {formData.currency}. 
            Exchange rates are updated in real-time.
          </p>
        </div>
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
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-lg">
            <span>Room Rate ({formData.numberOfNights} nights)</span>
            <span>{formatCurrency(formData.pricePerNight * formData.numberOfNights, 'SGD')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxes & Fees</span>
            <span>Included</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-xl font-bold text-green-600">
            <span>Total Amount (SGD)</span>
            <span>{formatCurrency(formData.totalAmount, 'SGD')}</span>
          </div>
          {formData.currency !== 'SGD' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
              <div className="flex justify-between text-lg font-semibold text-blue-800">
                <span>💳 You'll pay in {formData.currency}</span>
                <span>{formatCurrencyWithSymbol(convertFromSGD(formData.totalAmount, formData.currency), formData.currency)}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Exchange rate: {getExchangeDisplay(formData.totalAmount, formData.currency)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-yellow-800">Payment</h3>
        <p className="text-yellow-700 mb-4">
          Click "Proceed to Payment" to complete your booking securely with Stripe.
          You'll be redirected to a secure payment page.
        </p>
        
        <div className="space-y-4">
          {!isAuthenticated() ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="text-red-800 font-semibold mb-2">⚠️ Login Required</h4>
              <p className="text-red-700 text-sm mb-3">
                You must be logged in to create a booking. Your booking will be saved to your account.
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: location } })}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Login to Continue
              </button>
            </div>
          ) : (
            <>
              <PaymentButton 
                bookingData={formData} 
                isSubmitting={isSubmitting}
              />
              
              <p className="text-xs text-gray-500 text-center">
                🔒 Your payment is secured by Stripe. No card details are stored on our servers.
              </p>
            </>
          )}
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
              Complete Your Booking
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
