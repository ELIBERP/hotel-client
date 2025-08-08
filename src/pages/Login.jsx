import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = (user) => {
    console.log('✅ Authentication successful:', user);
    // Redirect to booking form after successful login
    navigate('/booking-form');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏨 Hotel Booking System
          </h1>
          <p className="text-gray-600">
            Please sign in to continue with your booking
          </p>
        </div>
        
        <AuthForm onAuthSuccess={handleAuthSuccess} />
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
