import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils/test-wrapper';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from '../LoginForm';
import { authService } from '@/lib/aws/cognito';

// Mock the auth service
jest.mock('@/lib/aws/cognito');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
      expect(screen.getByText(/regístrate/i)).toBeInTheDocument();
    });

    it('has proper form attributes', () => {
      render(<LoginForm />);
      
      const form = document.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when fields are empty', () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when both fields have values', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(submitButton).toBeEnabled();
    });

    it('clears errors when user starts typing', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: false,
        error: 'Correo electrónico o contraseña incorrectos'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // Fill form and submit to trigger error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correo electrónico o contraseña incorrectos/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'new');
      await waitFor(() => {
        expect(screen.queryByText(/correo electrónico o contraseña incorrectos/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('submits form with valid credentials', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: true,
        token: 'mock-token'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.signIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard/index.html');
    });

    it('handles authentication errors correctly', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: false,
        error: 'Correo electrónico o contraseña incorrectos'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correo electrónico o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      mockAuthService.signIn.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      // Mock a delayed response
      mockAuthService.signIn.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      // Check loading state - button text changes and becomes disabled
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText(/iniciando sesión/i)).not.toBeInTheDocument();
      });
    });
  });



  describe('Form Interactions', () => {
    it('disables submit button when fields are empty', () => {
      render(<LoginForm />);
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when both fields have values', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      expect(submitButton).toBeEnabled();
    });

    it('trims email input', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: true,
        token: 'mock-token'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, '  test@example.com  ');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.signIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!'
        });
      });
    });
  });

  describe('Navigation Links', () => {
    it('renders forgot password link', () => {
      render(<LoginForm />);
      
      const forgotPasswordLink = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password/index.html');
    });

    it('renders create account link', () => {
      render(<LoginForm />);
      
      const createAccountLink = screen.getByRole('link', { name: /regístrate/i });
      expect(createAccountLink).toHaveAttribute('href', '/auth/register/index.html');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginForm />);
      
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    });

    it('displays error messages correctly', async () => {
      mockAuthService.signIn.mockResolvedValue({
        success: false,
        error: 'Correo electrónico o contraseña incorrectos'
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correo electrónico o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Fill fields to enable button, then tab to it
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });
}); 