import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        // If no valid session, redirect to login
        navigate('/', { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSaving(true);
    const startTime = Date.now();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      // Ensure minimum 3 seconds have passed
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      if (error) {
        console.error('Error updating password:', error);
        alert('Error updating password: ' + error.message);
        setIsSaving(false);
      } else {
        console.log('Password updated successfully');
        setIsSuccess(true);
        setIsSaving(false);
        
        // Auto-navigate to login after 2 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
      setIsSaving(false);
    }
  };

  const goToLogin = () => {
    navigate('/', { replace: true });
  };

  if (!hasValidSession) {
    return (
      <div className="container">
        <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
        <p style={{ color: '#888', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container">
        <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#4CAF50' }}>✓</div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Password Updated!
          </h2>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            Your password has been successfully updated. Redirecting to login...
          </p>
          <div className="spinner" style={{ 
            display: 'inline-block', 
            width: '20px', 
            height: '20px', 
            border: '2px solid #444',
            borderTop: '2px solid #4CAF50',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
      <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Reset Password</h2>
      
      <p style={{ color: '#888', textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>
        Enter your new password below.
      </p>
      
      <div className="input-container">
        <div className="input-with-toggle">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
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
        
        <div className="input-with-toggle">
          <input 
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            type="button"
            className="toggle-button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '○' : '●'}
          </button>
        </div>
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleSavePassword}
        disabled={isSaving}
      >
        {isSaving ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner" style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Updating password...
          </div>
        ) : (
          'Save New Password'
        )}
      </button>
      <button className="button-link" onClick={goToLogin}>Back to Login</button>
    </div>
  );
}

export default NewPassword;