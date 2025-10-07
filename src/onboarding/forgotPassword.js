import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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
      <div style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '4rem',
        paddingBottom: '4rem',
        position: 'relative',
        overflow: 'auto',
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
            marginBottom: '3rem',
            position: 'relative'
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <img
                src="/bob_logo.png"
                alt="Band of Brothers"
                style={{
                  width: '80px',
                  height: '80px',
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

            <div style={{
              marginTop: '1.5rem',
              height: '4px',
              background: 'linear-gradient(to right, transparent, #b45309, transparent)',
              opacity: 0.4
            }}></div>
          </div>

          {/* Success Message */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid #1f2937',
            borderRadius: '0.75rem',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>
              📧
            </div>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f5f5f5',
              marginBottom: '1rem',
              letterSpacing: '0.05em'
            }}>
              CHECK YOUR EMAIL
            </h2>

            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              If an account with that email exists, we sent you a password reset link to:
            </p>

            <p style={{
              color: '#d97706',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem',
              wordBreak: 'break-all'
            }}>
              {email}
            </p>

            <p style={{
              color: '#6b7280',
              fontSize: '0.75rem',
              lineHeight: '1.5'
            }}>
              Check your email and click the link to reset your password.
            </p>
          </div>

          {/* Back to Login */}
          <button
            onClick={goToLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              marginTop: '1rem',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#d97706';
              e.target.style.color = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#374151';
              e.target.style.color = '#d1d5db';
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: '4rem',
      paddingBottom: '4rem',
      position: 'relative',
      overflow: 'auto',
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
          marginBottom: '3rem',
          position: 'relative'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <img
              src="/bob_logo.png"
              alt="Band of Brothers"
              style={{
                width: '80px',
                height: '80px',
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
            RESET PASSWORD
          </p>

          <div style={{
            marginTop: '1.5rem',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #b45309, transparent)',
            opacity: 0.4
          }}></div>
        </div>

        {/* Reset Form */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid #1f2937',
          borderRadius: '0.75rem',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Email Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="email"
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

          {/* Send Reset Button */}
          <button
            onClick={handleSendReset}
            disabled={isSending}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isSending
                ? '#6b7280'
                : 'linear-gradient(to right, #b45309, #d97706)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              borderRadius: '0.5rem',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              cursor: isSending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!isSending) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            {isSending ? (
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
                SENDING...
              </>
            ) : (
              'SEND RESET LINK'
            )}
          </button>

          {/* Back to Login */}
          <button
            onClick={goToLogin}
            disabled={isSending}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isSending ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s',
              opacity: isSending ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isSending && (e.target.style.color = '#d97706')}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            Back to Login
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

export default ForgotPassword;
