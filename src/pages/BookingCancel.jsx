// pages/BookingCancel.jsx
import React from 'react';

const BookingCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCancel;
