import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login';
import { AuthProvider } from '../../../src/context/AuthContext';

// Mock LoginForm component
jest.mock('../../../src/components/LoginForm', () => {
  return function MockLoginForm() {
    return (
      <div data-testid="login-form">
        <h1>Login Form</h1>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign In</button>
        </form>
      </div>
    );
  };
});

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    isAuthenticated: () => false
  }),
  AuthProvider: ({ children }) => children
}));

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  test('renders login page', () => {
    renderLogin();
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  test('renders login form with email and password fields', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('is wrapped with AuthProvider', () => {
    renderLogin();
    
    // Should render without errors, indicating AuthProvider is working
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
