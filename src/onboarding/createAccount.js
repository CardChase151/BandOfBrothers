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
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      if (error) {
        console.error('Error creating account:', error);
        alert('Error creating account: ' + error.message);
        setIsCreatingAccount(false);
      } else {
        console.log('Account created successfully:', data);
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
    <div className="create-container">
      <h1 className="create-title">Create Account</h1>
      <h2 className="create-subtitle">Team Ins<span className="create-accent">p</span>ire</h2>
      
      <div className="create-input-container">
        <input
          className="create-input"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          spellCheck="false"
          enterKeyHint="next"
        />
        <input
          className="create-input"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          spellCheck="false"
          enterKeyHint="next"
        />
        <input
          className="create-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          inputMode="email"
          enterKeyHint="next"
        />
        
        <div className="create-password-wrapper">
          <input
            className="create-input create-password-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            spellCheck="false"
            enterKeyHint="next"
          />
          <button 
            type="button"
            className="create-toggle-button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '○' : '●'}
          </button>
        </div>
        
        <div className="create-password-wrapper">
          <input
            className="create-input create-password-input"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            spellCheck="false"
            enterKeyHint="done"
          />
          <button 
            type="button"
            className="create-toggle-button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '○' : '●'}
          </button>
        </div>
      </div>
      
      <button 
        className="create-primary-button" 
        onClick={handleCreateAccount}
        disabled={isCreatingAccount}
      >
        {isCreatingAccount ? (
          <div className="create-loading">
            <div className="create-spinner"></div>
            We're sending you an email...
          </div>
        ) : (
          'Verify Account'
        )}
      </button>
      
      <button 
        className="create-link-button" 
        onClick={goToLogin}
      >
        Already have an account? Login
      </button>
    </div>
  );
}

export default CreateAccount;