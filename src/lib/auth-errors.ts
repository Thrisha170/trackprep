import { AuthError } from '@supabase/supabase-js';

/**
 * Maps authentication errors to user-friendly messages.
 * Prevents account enumeration by using generic messages for credential errors.
 */
export const getAuthErrorMessage = (error: AuthError, context: 'signin' | 'signup'): string => {
  // Log detailed error for debugging (server-side in production)
  console.error('Auth error:', error.message);

  // Handle specific errors that are safe to show to users
  const errorMessage = error.message.toLowerCase();

  // Email confirmation required - safe to show
  if (errorMessage.includes('email not confirmed') || errorMessage.includes('confirm your email')) {
    return 'Please check your email and confirm your account before signing in.';
  }

  // Rate limiting - safe to show
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  // Network errors - safe to show
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  // For signup-specific errors
  if (context === 'signup') {
    // Email already exists - use generic message to prevent enumeration
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      return 'Unable to create account. Please try again or use a different email.';
    }
    
    // Password requirements
    if (errorMessage.includes('password')) {
      return 'Password does not meet requirements. Please use a stronger password.';
    }
    
    // Invalid email format
    if (errorMessage.includes('invalid email') || errorMessage.includes('valid email')) {
      return 'Please enter a valid email address.';
    }
    
    return 'Unable to create account. Please check your information and try again.';
  }

  // For signin - use generic message to prevent account enumeration
  // This covers: invalid credentials, user not found, wrong password, etc.
  return 'Invalid email or password. Please try again.';
};
