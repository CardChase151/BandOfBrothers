import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsLoggingIn(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      // Ensure minimum 3 seconds have passed
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      if (error) {
        console.error('Error logging in:', error);
        alert('Login failed: ' + error.message);
        setIsLoggingIn(false);
      } else {
        console.log('Login successful:', data);
        // Navigate to home screen
        navigate('/home');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
      setIsLoggingIn(false);
    }
  };

  const goToCreateAccount = () => {
    navigate('/create-account');
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="container">
      <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
      
      <div className="input-container">
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="input-with-toggle">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button"
            className="toggle-button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '○' : '●'}
          </button>
        </div>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleLogin}
        disabled={isLoggingIn}
        style={{ maxWidth: '300px' }}
      >
        {isLoggingIn ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner" style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Logging in...
          </div>
        ) : (
          'Login'
        )}
      </button>
      <button className="button-secondary" onClick={goToCreateAccount} style={{ maxWidth: '300px' }}>Create Account</button>
      <button className="button-link" onClick={goToForgotPassword}>Forgot Password?</button>
    </div>
  );
}

export default Login;