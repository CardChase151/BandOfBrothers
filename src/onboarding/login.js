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

      if (error) {
        console.error('Error logging in:', error);
        alert('Login failed: ' + error.message);
        setIsLoggingIn(false);
        return;
      }

      // Check if user profile exists, create if missing
      if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // If no profile exists, create one from auth metadata
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Creating user profile from metadata...');
          console.log('Auth user data:', data.user);
          
          const metadata = data.user.user_metadata || {};
          console.log('Metadata:', metadata);
          
          const firstName = metadata.first_name || '';
          const lastName = metadata.last_name || '';
          
          console.log('Extracted names:', { firstName, lastName });
          
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: data.user.email,
              first_name: firstName,
              last_name: lastName,
              role: 'user'
            }]);
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Don't fail login - they can still use the app
          } else {
            console.log('User profile created successfully with names:', { firstName, lastName });
          }
        } else if (userProfile) {
          console.log('User profile already exists:', userProfile);
        }
      }

      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      console.log('Login successful:', data);
      navigate('/home');
      
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
    <div className="login-container">
      <h1 className="login-title">Team Ins<span className="login-accent">p</span>ire</h1>
      
      <div className="login-input-container">
        <input 
          className="login-input"
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="login-password-wrapper">
          <input 
            className="login-input login-password-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button"
            className="login-toggle-button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '○' : '●'}
          </button>
        </div>
      </div>
      
      <button 
        className="login-primary-button" 
        onClick={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <div className="login-loading">
            <div className="login-spinner"></div>
            Logging in...
          </div>
        ) : (
          'Login'
        )}
      </button>
      
      <button 
        className="login-secondary-button" 
        onClick={goToCreateAccount}
        disabled={isLoggingIn}
      >
        Create Account
      </button>
      
      <button 
        className="login-link-button" 
        onClick={goToForgotPassword}
        disabled={isLoggingIn}
      >
        Forgot Password?
      </button>
    </div>
  );
}

export default Login;