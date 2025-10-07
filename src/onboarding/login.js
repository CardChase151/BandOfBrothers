import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && !error) {
          console.log('Existing session found, redirecting to home');
          navigate('/home', { replace: true });
          return;
        }

        console.log('No existing session found');
        setIsCheckingSession(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

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

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #d97706',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Camo Pattern Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        backgroundImage: `
          radial-gradient(ellipse 200px 150px at 20% 30%, #3d4a3d 0%, transparent 50%),
          radial-gradient(ellipse 250px 180px at 70% 20%, #2d3a2d 0%, transparent 50%),
          radial-gradient(ellipse 220px 200px at 40% 70%, #4a5a4a 0%, transparent 50%),
          radial-gradient(ellipse 280px 160px at 85% 60%, #3a4a3a 0%, transparent 50%),
          radial-gradient(ellipse 180px 220px at 10% 80%, #2a3a2a 0%, transparent 50%),
          radial-gradient(ellipse 240px 140px at 60% 90%, #3d4d3d 0%, transparent 50%)
        `,
        backgroundColor: '#0a0a0a'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hero Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          position: 'relative'
        }}>
          {/* Shield Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: '#f5f5f5',
            marginBottom: '0.5rem',
            letterSpacing: '0.05em',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'nowrap'
          }}>
            BAND OF BROTHERS
          </h1>

          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            fontWeight: '700',
            letterSpacing: '0.2em'
          }}>
            BOOTCAMP
          </p>

          <div style={{
            marginTop: '1.5rem',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #b45309, transparent)',
            opacity: 0.4
          }}></div>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid #1f2937',
          borderRadius: '0.75rem',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Email Input */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="email"
              enterKeyHint="next"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#f5f5f5',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d97706'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          {/* Password Input */}
          <div style={{
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              spellCheck="false"
              enterKeyHint="done"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                paddingRight: '3rem',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#f5f5f5',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d97706'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              {showPassword ? '○' : '●'}
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isLoggingIn
                ? '#6b7280'
                : 'linear-gradient(to right, #b45309, #d97706)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              borderRadius: '0.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoggingIn) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            {isLoggingIn ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite'
                }}></div>
                LOGGING IN...
              </>
            ) : (
              'LOGIN'
            )}
          </button>

          {/* Create Account Button */}
          <button
            onClick={goToCreateAccount}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '1rem',
              opacity: isLoggingIn ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoggingIn) {
                e.target.style.borderColor = '#d97706';
                e.target.style.color = '#d97706';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#374151';
              e.target.style.color = '#d1d5db';
            }}
          >
            Create Account
          </button>

          {/* Forgot Password Link */}
          <button
            onClick={goToForgotPassword}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s',
              opacity: isLoggingIn ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isLoggingIn && (e.target.style.color = '#d97706')}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* Add keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Login;
