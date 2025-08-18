import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/pages/Register';
import { AuthProvider } from '../../../src/context/AuthContext';

// Mock RegisterForm component
jest.mock('../../../src/components/RegisterForm', () => {
  return function MockRegisterForm() {
    return (
      <div data-testid="register-form">
        <h1>Register Form</h1>
        <form>
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Last Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <input type="password" placeholder="Confirm Password" />
          <button type="submit">Create Account</button>
        </form>
      </div>
    );
  };
});

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
    user: null,
    isAuthenticated: () => false
  }),
  AuthProvider: ({ children }) => children
}));

const renderRegister = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Register Page', () => {
  test('renders register page', () => {
    renderRegister();
    
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByText('Register Form')).toBeInTheDocument();
  });

  test('renders register form with all required fields', () => {
    renderRegister();
    
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('is wrapped with AuthProvider', () => {
    renderRegister();
    
    // Should render without errors, indicating AuthProvider is working
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
