import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    console.log('Create account clicked:', firstName, lastName, email, password);
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsCreatingAccount(true);
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      // Ensure minimum 3 seconds have passed
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      if (error) {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + error.message);
        setIsCreatingAccount(false);
      } else {
        console.log('Account created successfully:', data);
        // Navigate to email verify screen with user data
        navigate('/email-verify', { 
          state: { 
            email: email,
            userData: { firstName, lastName, email }
          }
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
      setIsCreatingAccount(false);
    }
  };

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
      <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>Create Account</h2>
      
      <div className="input-container">
        <input 
          type="text" 
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
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
        
        <div className="input-with-toggle">
          <input 
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
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
        onClick={handleCreateAccount}
        disabled={isCreatingAccount}
        style={{ maxWidth: '300px' }}
      >
        {isCreatingAccount ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner" style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            We're sending you an email...
          </div>
        ) : (
          'Create Account'
        )}
      </button>
      <button className="button-link" onClick={goToLogin}>Already have an account? Login</button>
    </div>
  );
}

export default CreateAccount;