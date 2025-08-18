import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import RegisterForm from '../../../src/components/RegisterForm';
import { AuthProvider } from '../../../src/context/AuthContext';

// Mock the useAuth hook
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister
  }),
  AuthProvider: ({ children }) => children
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.alert
window.alert = jest.fn();

const renderRegisterForm = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    test('renders registration form with all required fields', () => {
      renderRegisterForm();
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    test('renders navigation links', () => {
      renderRegisterForm();
      
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in here/i })).toBeInTheDocument();
    });

    test('shows password toggle buttons', () => {
      renderRegisterForm();
      
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      
      // Find toggle buttons by their position
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      
      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('validates password strength', async () => {
      renderRegisterForm();
      
      // Fill required fields to avoid other validation errors
      const firstNameInput = screen.getByLabelText('First name');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      
      const lastNameInput = screen.getByLabelText('Last name');
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      
      const emailInput = screen.getByLabelText('Email address');
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      
      const confirmPasswordInput = screen.getByLabelText('Confirm password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Wait for validation to complete
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    test('validates password complexity', async () => {
      renderRegisterForm();
      
      // Fill required fields to avoid other validation errors
      const firstNameInput = screen.getByLabelText('First name');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      
      const lastNameInput = screen.getByLabelText('Last name');
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      
      const emailInput = screen.getByLabelText('Email address');
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'simplepassword' } });
      
      const confirmPasswordInput = screen.getByLabelText('Confirm password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'simplepassword' } });
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Wait for validation to complete
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeInTheDocument();
      });
    });

    test('validates password confirmation', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    test('clears errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      // Trigger validation errors
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      
      // Start typing in first name field
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');
      
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);
      
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123'
      });
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderRegisterForm();
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);
      
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('handles registration success', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });
      
      renderRegisterForm();
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Registration successful! Welcome to StayEase!');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles registration failure', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: false, error: 'User already exists' });
      
      renderRegisterForm();
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
    });

    test('handles network errors', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('Network error'));
      
      renderRegisterForm();
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      renderRegisterForm();
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    test('has proper error announcements', async () => {
      const user = userEvent.setup();
      renderRegisterForm();
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });
});
