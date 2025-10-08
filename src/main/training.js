import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, Shield, BookOpen, Sword, Heart, Crown, Flame, Users, Compass } from 'lucide-react';
import BottomNav from '../bottomnav/bottomnav';

function Training() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab] = useState('training');
  const navigate = useNavigate();

  // 9 Band of Brothers Training Sessions
  const sessions = [
    { id: 1, title: 'Masculine Heart', icon: Heart },
    { id: 2, title: 'Larger Story', icon: BookOpen },
    { id: 3, title: 'Poser', icon: Shield },
    { id: 4, title: 'Wounds', icon: Sword },
    { id: 5, title: 'New Name', icon: Crown },
    { id: 6, title: 'Warfare', icon: Flame },
    { id: 7, title: 'Rescue the Beauty', icon: Heart },
    { id: 8, title: 'Hearts of Your Children', icon: Users },
    { id: 9, title: 'Counsel and Direction', icon: Compass }
  ];

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

      setUser(session.user);

      // Get user profile
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

  const loadSessionContent = async (sessionTitle) => {
    setIsLoadingContent(true);
    try {
      const { data, error } = await supabase
        .from('training_content')
        .select('*')
        .eq('category', sessionTitle)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Error loading content: ' + error.message);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    loadSessionContent(session.title);
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setContentItems([]);
    setSearchQuery('');
  };

  const handleContentClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/home');
    else if (tab === 'schedule') navigate('/schedule');
    else if (tab === 'licensing') navigate('/licensing');
    else if (tab === 'prayer') navigate('/prayer');
    else if (tab === 'chat') navigate('/chat');
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Session List View
  if (!selectedSession) {
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
              marginBottom: '24px'
            }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#f5f5f5',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                TRAINING GROUND
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontStyle: 'italic'
              }}>
                He trains my hands for war, my fingers for battle - Psalm 144:1
              </p>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  color: '#f5f5f5',
                  fontSize: '1rem',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>

            {/* Session Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredSessions.map((session) => {
                const Icon = session.icon;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    style={{
                      backgroundColor: 'rgba(17, 24, 39, 0.6)',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d97706';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#374151';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                        <Icon size={24} color="#d97706" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#f5f5f5',
                          marginBottom: '4px'
                        }}>
                          {session.title}
                        </h3>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontWeight: '600',
                          letterSpacing: '0.05em'
                        }}>
                          SESSION {session.id}
                        </div>
                      </div>
                      <div style={{ color: '#d97706', fontSize: '1.5rem', fontWeight: '300' }}>→</div>
                    </div>
                  </div>
                );
              })}
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

  // Content List View
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
          {/* Back Button and Header */}
          <button
            onClick={handleBackToSessions}
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
            ← Back to Sessions
          </button>

          <div style={{
            borderBottom: '2px solid rgba(217, 119, 6, 0.3)',
            paddingBottom: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {(() => {
                const Icon = selectedSession.icon;
                return <Icon size={32} color="#d97706" />;
              })()}
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: '#f5f5f5',
                letterSpacing: '0.05em',
                margin: 0
              }}>
                {selectedSession.title}
              </h1>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              margin: 0
            }}>
              Session {selectedSession.id} training resources
            </p>
          </div>

          {/* Content Loading */}
          {isLoadingContent ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #d97706',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading content...</p>
            </div>
          ) : contentItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              border: '1px solid #374151',
              backdropFilter: 'blur(10px)'
            }}>
              <Shield size={48} color="#6b7280" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#f5f5f5', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
                No Content Available
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '24px' }}>
                There are no training materials available for this session yet.
              </p>
              <button
                onClick={handleBackToSessions}
                style={{
                  background: 'linear-gradient(to right, #b45309, #d97706)',
                  border: '1px solid rgba(217, 119, 6, 0.5)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  letterSpacing: '0.05em'
                }}
              >
                Browse Other Sessions
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleContentClick(item.url)}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.6)',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: item.url ? 'pointer' : 'default',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (item.url) {
                      e.currentTarget.style.borderColor = '#d97706';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {item.image_url && (
                    <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {item.url && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div style={{
                              width: 0,
                              height: 0,
                              borderLeft: '16px solid #ffffff',
                              borderTop: '10px solid transparent',
                              borderBottom: '10px solid transparent',
                              marginLeft: '4px'
                            }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#f5f5f5',
                      marginBottom: '8px'
                    }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p style={{
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                      }}>
                        {item.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        backgroundColor: 'rgba(217, 119, 6, 0.2)',
                        color: '#d97706',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {item.category}
                      </span>
                      {item.url && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#9ca3af',
                          fontSize: '0.75rem'
                        }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Resource
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

export default Training;
