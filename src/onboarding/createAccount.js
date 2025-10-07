import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '1rem',
      paddingTop: '2rem',
      paddingBottom: '2rem',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
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
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <img
              src="/bob_logo.png"
              alt="Band of Brothers"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
            />
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
            ENLIST NOW
          </p>

          <div style={{
            marginTop: '1.5rem',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #b45309, transparent)',
            opacity: 0.4
          }}></div>
        </div>

        {/* Create Account Form */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid #1f2937',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          {/* First Name */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              spellCheck="false"
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

          {/* Last Name */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              spellCheck="false"
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

          {/* Email */}
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

          {/* Password */}
          <div style={{
            marginBottom: '1rem',
            position: 'relative'
          }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              spellCheck="false"
              enterKeyHint="next"
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

          {/* Confirm Password */}
          <div style={{
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? '○' : '●'}
            </button>
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleCreateAccount}
            disabled={isCreatingAccount}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isCreatingAccount
                ? '#6b7280'
                : 'linear-gradient(to right, #b45309, #d97706)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              borderRadius: '0.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              cursor: isCreatingAccount ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!isCreatingAccount) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            {isCreatingAccount ? (
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
                ENLISTING...
              </>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>

          {/* Back to Login */}
          <button
            onClick={goToLogin}
            disabled={isCreatingAccount}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isCreatingAccount ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s',
              opacity: isCreatingAccount ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isCreatingAccount && (e.target.style.color = '#d97706')}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            Already have an account? Login
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

export default CreateAccount;
