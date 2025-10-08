import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import BottomNav from '../bottomnav/bottomnav';

function Profile() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/', { replace: true });
        return;
      }

      setUser(session.user);

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

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out');
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/home');
    else if (tab === 'training') navigate('/training');
    else if (tab === 'schedule') navigate('/schedule');
    else if (tab === 'licensing') navigate('/licensing');
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
          {/* Back Button */}
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#d97706',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#d97706';
              e.target.style.backgroundColor = 'rgba(217, 119, 6, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#374151';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to Home
          </button>

          {/* Header */}
          <div style={{
            borderBottom: '2px solid rgba(217, 119, 6, 0.3)',
            paddingBottom: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <User size={40} color="#d97706" />
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#f5f5f5',
                letterSpacing: '0.05em',
                margin: 0
              }}>
                PROFILE
              </h1>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontStyle: 'italic',
              margin: 0
            }}>
              Stand firm in the faith; be courageous; be strong - 1 Corinthians 16:13
            </p>
          </div>

          {/* Profile Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {/* Name */}
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                flexShrink: 0,
                width: '48px',
                height: '48px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={24} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  NAME
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#f5f5f5'
                }}>
                  {userProfile?.first_name || ''} {userProfile?.last_name || ''}
                </div>
              </div>
            </div>

            {/* Email */}
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                flexShrink: 0,
                width: '48px',
                height: '48px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail size={24} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  EMAIL
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#f5f5f5',
                  wordBreak: 'break-word'
                }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>

            {/* Role */}
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                flexShrink: 0,
                width: '48px',
                height: '48px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={24} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  ROLE
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#f5f5f5',
                  textTransform: 'uppercase'
                }}>
                  {userProfile?.role || 'user'}
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                flexShrink: 0,
                width: '48px',
                height: '48px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #374151',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  marginBottom: '4px'
                }}>
                  MEMBER SINCE
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#f5f5f5'
                }}>
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #b45309, #d97706)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '32px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            <LogOut size={18} />
            LOGOUT
          </button>

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

export default Profile;
