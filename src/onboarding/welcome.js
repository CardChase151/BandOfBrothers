import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Welcome() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [needsNameInput, setNeedsNameInput] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('No session found:', sessionError);
          navigate('/', { replace: true });
          return;
        }

        const user = session.user;
        console.log('OAuth user data:', user);

        // Extract user info
        const metadata = user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || '';
        const metaFirstName = metadata.given_name || metadata.first_name || '';
        const metaLastName = metadata.family_name || metadata.last_name || '';
        const email = user.email || '';

        setUserEmail(email);
        setUserId(user.id);

        // Check if user profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (existingProfile) {
          // Profile exists, show success
          console.log('User profile already exists:', existingProfile);
          setUserName(existingProfile.first_name + ' ' + existingProfile.last_name);
          setIsProcessing(false);
          setShowSuccess(true);

          setTimeout(() => {
            navigate('/home', { replace: true });
          }, 2500);
          return;
        }

        // Profile doesn't exist - check if we have first/last name
        if (metaFirstName && metaLastName) {
          // We have both names, create profile
          setUserName(metaFirstName + ' ' + metaLastName);
          await createUserProfile(user.id, email, metaFirstName, metaLastName);
        } else {
          // Need to collect names from user
          console.log('Need to collect first and last name from user');

          // Pre-fill with best guess from full name
          if (fullName) {
            const nameParts = fullName.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
          }

          setIsProcessing(false);
          setNeedsNameInput(true);
        }

      } catch (error) {
        console.error('Error in OAuth callback:', error);
        navigate('/', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const createUserProfile = async (uid, email, first, last) => {
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: uid,
          email: email,
          first_name: first,
          last_name: last,
          role: 'user'
        }]);

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      } else {
        console.log('User profile created successfully');
        setUserName(first + ' ' + last);
        setNeedsNameInput(false);
        setIsSubmitting(false);
        setIsProcessing(false);
        setShowSuccess(true);

        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 2500);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleNameSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first and last name');
      return;
    }

    setIsSubmitting(true);
    await createUserProfile(userId, userEmail, firstName.trim(), lastName.trim());
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
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
        maxWidth: '500px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '3rem'
        }}>
          <img
            src="/bob_logo.png"
            alt="Band of Brothers"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              opacity: showSuccess || needsNameInput ? 1 : 0.7,
              transition: 'opacity 0.5s ease-out'
            }}
          />
        </div>

        {needsNameInput ? (
          // Name Input Form
          <div style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid #1f2937',
            borderRadius: '0.75rem',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#f5f5f5',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}>
              ONE MORE STEP
            </h2>

            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginBottom: '2rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Help us personalize your experience.<br/>
              Your name will be used in chats and your profile.
            </p>

            {/* First Name */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
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
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
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

            {/* Submit Button */}
            <button
              onClick={handleNameSubmit}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: isSubmitting
                  ? '#6b7280'
                  : 'linear-gradient(to right, #b45309, #d97706)',
                border: '1px solid rgba(217, 119, 6, 0.5)',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: '900',
                letterSpacing: '0.1em',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'PROCESSING...' : 'CONTINUE'}
            </button>
          </div>
        ) : (
          // Success View
          <>
            {/* Welcome Message */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#f5f5f5',
              marginBottom: '1rem',
              letterSpacing: '0.05em',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              opacity: showSuccess ? 1 : 0.7,
              transition: 'opacity 0.5s ease-out'
            }}>
              WELCOME TO<br/>BAND OF BROTHERS
            </h1>

            {/* User Name */}
            {userName && (
              <p style={{
                color: '#d97706',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '3rem',
                opacity: showSuccess ? 1 : 0,
                transition: 'opacity 0.5s ease-out'
              }}>
                {userName}
              </p>
            )}

            {/* Simple Checkmark */}
            <div style={{
              fontSize: '3rem',
              color: '#10b981',
              opacity: showSuccess ? 1 : 0,
              transform: showSuccess ? 'scale(1)' : 'scale(0.5)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
            }}>
              ✓
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Welcome;
