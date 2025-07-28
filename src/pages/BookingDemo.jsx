// pages/BookingDemo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BookingDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏨 Hotel Booking System Demo
          </h1>
          <p className="text-xl text-gray-600">
            Choose your booking experience below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Complete Booking Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Complete Booking Form
              </h2>
              <p className="text-green-600">
                Full guest information collection with Stripe integration
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Guest information form (name, email, phone)
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Special requests field
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Booking creation API integration
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Stripe checkout with specified pricing
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Two-step process with validation
              </div>
            </div>

            <Link
              to="/booking-form"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 block text-center"
            >
              Try Complete Booking Form →
            </Link>
          </div>

          {/* Quick Payment Test */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">
                Quick Payment Test
              </h2>
              <p className="text-blue-600">
                Simple payment testing with pre-filled data
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Pre-filled booking data
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Direct Stripe integration
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Test card instructions
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Quick testing workflow
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Debug information
              </div>
            </div>

            <Link
              to="/test-payment"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 block text-center"
            >
              Try Quick Payment Test →
            </Link>
          </div>
        </div>

        {/* API Testing Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 API Testing Information
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">📡 Backend Endpoints</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div><strong>Create Booking:</strong> <code>POST /api/bookings</code></div>
                <div><strong>Get Booking:</strong> <code>GET /api/bookings/:id</code></div>
                <div><strong>Create Payment:</strong> <code>POST /api/payment/create-checkout-session</code></div>
                <div><strong>Get Payment Details:</strong> <code>GET /api/payment/booking-details/:sessionId</code></div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">💳 Test Stripe Cards</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div><strong>Success:</strong> <code>4242 4242 4242 4242</code></div>
                <div><strong>Decline:</strong> <code>4000 0000 0000 0002</code></div>
                <div><strong>Requires Auth:</strong> <code>4000 0025 0000 3155</code></div>
                <div><strong>Expiry:</strong> Any future date like <code>12/34</code></div>
                <div><strong>CVC:</strong> Any 3 digits like <code>123</code></div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Make sure both backend (port 3000) and frontend (port 5173) servers are running</li>
              <li>• All payments use Stripe test mode - no real money is charged</li>
              <li>• Check browser console for detailed debugging information</li>
              <li>• Booking data is stored in memory and will reset on server restart</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDemo;
