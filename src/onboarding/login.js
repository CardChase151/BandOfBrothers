import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  // Clear error when user starts typing
  useEffect(() => {
    if (loginError && (email || password)) {
      setLoginError('');
    }
  }, [email, password, loginError]);

  // Check if user is already logged in on component mount
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
    if (!email.trim()) {
      setLoginError('Please enter your email address');
      return false;
    }
    
    if (!password.trim()) {
      setLoginError('Please enter your password');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLoginError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      // Ensure minimum loading time for better UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      if (error) {
        console.error('Login error:', error);
        
        // User-friendly error messages
        let userMessage = 'Login failed. Please check your credentials.';
        if (error.message.toLowerCase().includes('invalid login')) {
          userMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          userMessage = 'Please verify your email before logging in.';
        } else if (error.message.toLowerCase().includes('too many requests')) {
          userMessage = 'Too many login attempts. Please wait a moment and try again.';
        }
        
        setLoginError(userMessage);
        setIsLoggingIn(false);
      } else {
        console.log('Login successful:', data);
        // Navigation is handled by the auth state change listener
        navigate('/home', { replace: true });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !isLoggingIn) {
      handleLogin();
    }
  };

  const goToCreateAccount = () => {
    navigate('/create-account');
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container">
      <h1 className="title">
        Team Ins<span className="brand-accent">p</span>ire
      </h1>
      
      {/* Error Display */}
      {loginError && (
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
          {loginError}
        </div>
      )}
      
      <div className="input-container">
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoggingIn}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Email address"
        />
        
        <div className="input-with-toggle">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoggingIn}
            autoComplete="current-password"
            aria-label="Password"
          />
          <button 
            type="button"
            className="toggle-button"
            onClick={togglePasswordVisibility}
            disabled={isLoggingIn}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex="-1"
          >
            {showPassword ? '○' : '●'}
          </button>
        </div>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleLogin}
        disabled={isLoggingIn || !email.trim() || !password.trim()}
        aria-label="Login to your account"
      >
        {isLoggingIn ? (
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
            <span>Logging in...</span>
          </div>
        ) : (
          'Login'
        )}
      </button>
      
      <button 
        className="button-secondary" 
        onClick={goToCreateAccount}
        disabled={isLoggingIn}
        aria-label="Create a new account"
      >
        Create Account
      </button>
      
      <button 
        className="button-link" 
        onClick={goToForgotPassword}
        disabled={isLoggingIn}
        aria-label="Reset your password"
      >
        Forgot Password?
      </button>
    </div>
  );
}

export default Login;