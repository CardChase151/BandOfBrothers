import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function EmailVerify() {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email || 'your email';
  const userData = location.state?.userData || {};

  useEffect(() => {
    let interval;
    
    const checkVerification = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && user.email_confirmed_at) {
          setIsVerified(true);
          setIsChecking(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
    };

    // Check immediately
    checkVerification();
    
    // Then poll every 3 seconds
    interval = setInterval(checkVerification, 3000);

    // Cleanup interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const goToLogin = () => {
    navigate('/');
  };

  const editEmail = () => {
    navigate('/create-account', { 
      state: { 
        prefillData: {
          ...userData,
          email: ''  // Clear email for correction
        }
      }
    });
  };

  return (
    <div className="container">
      <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
      
      {!isVerified ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Check Your Email
            </h2>
            <p style={{ color: '#888', marginBottom: '1rem' }}>
              We sent a verification email to:
            </p>
            <p style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              {email}
            </p>
            
            {isChecking && (
              <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div className="spinner" style={{ 
                  display: 'inline-block', 
                  width: '12px', 
                  height: '12px', 
                  border: '2px solid #444',
                  borderTop: '2px solid #ff4444',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Checking for verification...
              </div>
            )}
          </div>
          
          <button className="button-secondary" onClick={editEmail}>
            Edit Email
          </button>
          <button className="button-link" onClick={goToLogin}>
            Back to Login
          </button>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#4CAF50' }}>✓</div>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
              Your account has been successfully verified.
            </p>
          </div>
          
          <button className="button-primary" onClick={goToLogin}>
            Continue to Login
          </button>
        </>
      )}
    </div>
  );
}

export default EmailVerify;