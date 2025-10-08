import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mountain, Calendar, MapPin, Users, Shield } from 'lucide-react';
import BottomNav from '../bottomnav/bottomnav';

function Retreats() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('schedule');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/', { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) setUserProfile(profile);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/', { replace: true });
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/home');
    else if (tab === 'training') navigate('/training');
    else if (tab === 'licensing') navigate('/merch');
    else if (tab === 'prayer') navigate('/prayer');
    else if (tab === 'chat') navigate('/chat');
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #d97706',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(to bottom right, #000000, #1a1a1a, #000000)',
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Camo Pattern Background */}
        <div style={{
          position: 'fixed',
          inset: 0,
          bottom: '100px',
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(ellipse 200px 150px at 20% 30%, #3d4a3d 0%, transparent 50%),
            radial-gradient(ellipse 250px 180px at 70% 20%, #2d3a2d 0%, transparent 50%),
            radial-gradient(ellipse 220px 200px at 40% 70%, #4a5a4a 0%, transparent 50%),
            radial-gradient(ellipse 280px 160px at 85% 60%, #3a4a3a 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }}></div>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{
            borderBottom: '2px solid rgba(217, 119, 6, 0.3)',
            paddingBottom: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Mountain size={40} color="#d97706" />
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#f5f5f5',
                letterSpacing: '0.05em',
                margin: 0
              }}>
                RETREATS & EVENTS
              </h1>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontStyle: 'italic',
              margin: 0
            }}>
              Iron sharpens iron, and one man sharpens another - Proverbs 27:17
            </p>
          </div>

          {/* Coming Soon Section */}
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            borderRadius: '12px',
            border: '1px solid #374151',
            backdropFilter: 'blur(10px)',
            marginBottom: '32px'
          }}>
            <Shield size={64} color="#d97706" style={{ margin: '0 auto 24px' }} />
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#f5f5f5',
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              COMING SOON
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem',
              lineHeight: '1.6',
              maxWidth: '500px',
              margin: '0 auto 32px'
            }}>
              We're preparing powerful retreat experiences where brothers gather to train, heal, and grow stronger together in the battle.
            </p>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              borderRadius: '8px',
              padding: '12px 24px'
            }}>
              <span style={{
                color: '#d97706',
                fontSize: '0.875rem',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}>
                DETAILS COMING SOON
              </span>
            </div>
          </div>

          {/* Placeholder Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <Calendar size={24} color="#d97706" style={{ marginBottom: '12px' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#f5f5f5',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                DATES
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                TBA
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <MapPin size={24} color="#d97706" style={{ marginBottom: '12px' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#f5f5f5',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                LOCATION
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                TBA
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <Users size={24} color="#d97706" style={{ marginBottom: '12px' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#f5f5f5',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                CAPACITY
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                TBA
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <Shield size={24} color="#d97706" style={{ marginBottom: '12px' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#f5f5f5',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
              REGISTRATION
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                TBA
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '40px 20px 20px',
            marginTop: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: '#666666'
          }}>
            <a
              href="https://appcatalyst.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#666666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#888888'}
              onMouseLeave={(e) => e.target.style.color = '#666666'}
            >
              Built by AppCatalyst
            </a>
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} user={userProfile} />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

export default Retreats;
