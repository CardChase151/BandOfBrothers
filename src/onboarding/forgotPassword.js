import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './onboarding.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSendReset = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsSending(true);
    const startTime = Date.now();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/new-password`
      });

      // Ensure minimum 3 seconds have passed
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      if (error) {
        console.error('Error sending reset email:', error);
        alert('Error sending reset email: ' + error.message);
        setIsSending(false);
      } else {
        console.log('Reset email sent successfully');
        setEmailSent(true);
        setIsSending(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
      setIsSending(false);
    }
  };

  const goToLogin = () => {
    navigate('/');
  };

  if (emailSent) {
    return (
      <div className="container">
        <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Check Your Email
          </h2>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            If an account with that email exists, we sent you a password reset link to:
          </p>
          <p style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            {email}
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Check your email and click the link to reset your password.
          </p>
        </div>
        
        <button className="button-link" onClick={goToLogin}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
      <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Reset Password</h2>
      
      <p style={{ color: '#888', textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <div className="input-container">
        <input 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <button 
        className="button-primary" 
        onClick={handleSendReset}
        disabled={isSending}
      >
        {isSending ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner" style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Sending reset link...
          </div>
        ) : (
          'Send Reset Link'
        )}
      </button>
      <button className="button-link" onClick={goToLogin}>Back to Login</button>
    </div>
  );
}

export default ForgotPassword;