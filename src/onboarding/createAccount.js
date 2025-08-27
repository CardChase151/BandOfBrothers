import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function CreateAccount() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill form data if coming from email verification screen
  useEffect(() => {
    const prefillData = location.state?.prefillData;
    if (prefillData) {
      setFirstName(prefillData.firstName || '');
      setLastName(prefillData.lastName || '');
      setEmail(prefillData.email || '');
    }
  }, [location.state]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
    if (generalError) {
      setGeneralError('');
    }
  }, [firstName, lastName, email, password, confirmPassword, formErrors, generalError]);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home', { replace: true });
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const validateForm = () => {
    const errors = {};

    // First Name validation
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    // Confirm Password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreatingAccount(true);
    setGeneralError('');
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim()
          }
        }
      });
      
      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      if (error) {
        console.error('Account creation error:', error);
        
        // User-friendly error messages
        let userMessage = 'Account creation failed. Please try again.';
        if (error.message.toLowerCase().includes('user already registered')) {
          userMessage = 'An account with this email already exists. Try logging in instead.';
        } else if (error.message.toLowerCase().includes('invalid email')) {
          userMessage = 'Please enter a valid email address.';
        } else if (error.message.toLowerCase().includes('password')) {
          userMessage = 'Password does not meet requirements. Please try a stronger password.';
        } else if (error.message.toLowerCase().includes('rate limit')) {
          userMessage = 'Too many signup attempts. Please wait a moment and try again.';
        }
        
        setGeneralError(userMessage);
        setIsCreatingAccount(false);
      } else {
        console.log('Account created successfully:', data);
        
        // Navigate to email verification with user data
        navigate('/email-verify', { 
          state: { 
            email: email.trim(),
            userData: { 
              firstName: firstName.trim(), 
              lastName: lastName.trim(), 
              email: email.trim() 
            }
          },
          replace: true
        });
      }
    } catch (error) {
      console.error('Unexpected account creation error:', error);
      setGeneralError('An unexpected error occurred. Please try again.');
      setIsCreatingAccount(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !isCreatingAccount) {
      handleCreateAccount();
    }
  };

  const goToLogin = () => {
    navigate('/', { replace: true });
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Helper function to get input error styling
  const getInputErrorStyle = (fieldName) => {
    if (formErrors[fieldName]) {
      return {
        borderColor: '#ff6b6b',
        boxShadow: '0 0 0 2px rgba(255, 107, 107, 0.2)'
      };
    }
    return {};
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && 
                     password && confirmPassword && Object.keys(formErrors).length === 0;

  return (
    <div className="container">
      <h1 className="title">
        Team Ins<span className="brand-accent">p</span>ire
      </h1>
      
      <h2>Create Account</h2>
      
      {/* General Error Display */}
      {generalError && (
        <div style={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
          color: '#ff6b6b',
          fontSize: 'var(--font-small)',
          textAlign: 'center',
          maxWidth: 'var(--input-width)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {generalError}
        </div>
      )}
      
      <div className="input-container">
        <div style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreatingAccount}
            autoComplete="given-name"
            autoCapitalize="words"
            aria-label="First name"
            style={getInputErrorStyle('firstName')}
          />
          {formErrors.firstName && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 'var(--font-small)',
              marginTop: 'var(--space-xs)',
              paddingLeft: 'var(--space-sm)'
            }}>
              {formErrors.firstName}
            </div>
          )}
        </div>

        <div style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreatingAccount}
            autoComplete="family-name"
            autoCapitalize="words"
            aria-label="Last name"
            style={getInputErrorStyle('lastName')}
          />
          {formErrors.lastName && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 'var(--font-small)',
              marginTop: 'var(--space-xs)',
              paddingLeft: 'var(--space-sm)'
            }}>
              {formErrors.lastName}
            </div>
          )}
        </div>

        <div style={{ width: '100%' }}>
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreatingAccount}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Email address"
            style={getInputErrorStyle('email')}
          />
          {formErrors.email && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 'var(--font-small)',
              marginTop: 'var(--space-xs)',
              paddingLeft: 'var(--space-sm)'
            }}>
              {formErrors.email}
            </div>
          )}
        </div>
        
        <div style={{ width: '100%' }}>
          <div className="input-with-toggle">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isCreatingAccount}
              autoComplete="new-password"
              aria-label="Password"
              style={getInputErrorStyle('password')}
            />
            <button 
              type="button"
              className="toggle-button"
              onClick={() => togglePasswordVisibility('password')}
              disabled={isCreatingAccount}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex="-1"
            >
              {showPassword ? '○' : '●'}
            </button>
          </div>
          {formErrors.password && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 'var(--font-small)',
              marginTop: 'var(--space-xs)',
              paddingLeft: 'var(--space-sm)'
            }}>
              {formErrors.password}
            </div>
          )}
        </div>
        
        <div style={{ width: '100%' }}>
          <div className="input-with-toggle">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isCreatingAccount}
              autoComplete="new-password"
              aria-label="Confirm password"
              style={getInputErrorStyle('confirmPassword')}
            />
            <button 
              type="button"
              className="toggle-button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              disabled={isCreatingAccount}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              tabIndex="-1"
            >
              {showConfirmPassword ? '○' : '●'}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <div style={{
              color: '#ff6b6b',
              fontSize: 'var(--font-small)',
              marginTop: 'var(--space-xs)',
              paddingLeft: 'var(--space-sm)'
            }}>
              {formErrors.confirmPassword}
            </div>
          )}
        </div>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleCreateAccount}
        disabled={isCreatingAccount || !isFormValid}
        aria-label="Create your account"
      >
        {isCreatingAccount ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 'var(--space-sm)' 
          }}>
            <div 
              className="spinner" 
              style={{ 
                width: '18px', 
                height: '18px', 
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%'
              }}
              aria-hidden="true"
            />
            <span>Creating account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </button>
      
      <button 
        className="button-link" 
        onClick={goToLogin}
        disabled={isCreatingAccount}
        aria-label="Go back to login"
      >
        Already have an account? Login
      </button>
    </div>
  );
}

export default CreateAccount;