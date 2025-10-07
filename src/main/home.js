import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import { getNextGreeting } from '../data/greetings';
import './content.css';
import '../onboarding/onboarding.css';

function Home() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [greetingMessage, setGreetingMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 HOME.JS LOADED - Team Inspire!');
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/', { replace: true });
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/', { replace: true });
          return;
        }

        console.log('Session found:', session.user.email);
        setUser(session.user);

        // Try to get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !profileError) {
          console.log('Profile found:', profile);
          setUserProfile(profile);

          // Get and set the next greeting
          const { message, nextIndex } = getNextGreeting(
            profile.first_name,
            profile.last_greeting_index
          );
          setGreetingMessage(message);

          // Update the last_greeting_index in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_greeting_index: nextIndex })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating greeting index:', updateError);
          }
        } else {
          console.log('No profile found or error:', profileError);
        }

        setLoading(false);
      } catch (error) {
        console.error('Unexpected error in checkUser:', error);
        navigate('/', { replace: true });
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/', { replace: true });
      } else if (session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Navigate to specific routes for certain tabs
    if (tab === 'training') {
      navigate('/training');
      return;
    }

    if (tab === 'schedule') {
      navigate('/schedule');
      return;
    }

    if (tab === 'licensing') {
      navigate('/licensing');
      return;
    }

    if (tab === 'prayer') {
      navigate('/prayer');
      return;
    }

    console.log(`Navigating to: ${tab}`);
  };

  const handleNewRepStart = () => {
    navigate('/newrepstart');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="home-content" style={{ alignItems: 'flex-start', padding: '20px' }}>
            {/* Verse Section */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '2px solid #d97706',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Badge Label */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '20px',
                background: 'linear-gradient(to right, #b45309, #d97706)',
                padding: '4px 16px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '900',
                letterSpacing: '0.1em',
                color: '#ffffff'
              }}>
                SCRIPTURE
              </div>

              <p style={{
                color: '#f5f5f5',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '12px',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                "Blessed be the LORD, my rock, who trains my hands for war, and my fingers for battle."
              </p>

              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: '700',
                textAlign: 'right',
                letterSpacing: '0.05em'
              }}>
                — PSALM 144:1
              </p>
            </div>

            {/* Agreement Section */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '2px solid #374151',
              borderLeft: '4px solid #d97706',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Badge Label */}
              <div style={{
                position: 'relative',
                marginBottom: '12px'
              }}>
                <div style={{
                  background: 'linear-gradient(to right, #b45309, #d97706)',
                  padding: '4px 16px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  display: 'inline-block'
                }}>
                  DECLARATION
                </div>
              </div>

              <p style={{
                color: '#f5f5f5',
                fontSize: '1rem',
                lineHeight: '1.8',
                marginBottom: '0',
                fontWeight: '500'
              }}>
                I break the agreement that <span style={{ color: '#d97706', fontWeight: '700' }}>masculinity is passivity</span>.
                I accept the truth that Jesus came not to bring peace but a sword, and <span style={{ color: '#d97706', fontWeight: '700' }}>I am here to always do good and do what's right</span>,
                and I accept that will create conflict.
              </p>
            </div>

            {/* Prayer Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(17, 24, 39, 0.6) 100%)',
              border: '2px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Corner Accents */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '20px',
                height: '20px',
                borderTop: '3px solid #d97706',
                borderLeft: '3px solid #d97706'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                borderTop: '3px solid #d97706',
                borderRight: '3px solid #d97706'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                width: '20px',
                height: '20px',
                borderBottom: '3px solid #d97706',
                borderLeft: '3px solid #d97706'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                borderBottom: '3px solid #d97706',
                borderRight: '3px solid #d97706'
              }}></div>

              {/* Badge Label */}
              <div style={{
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(to right, #b45309, #d97706)',
                  padding: '6px 20px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  display: 'inline-block',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  PRAYER
                </div>
              </div>

              <p style={{
                color: '#f5f5f5',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                textAlign: 'center',
                marginBottom: '0',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}>
                Lord, help me to be <span style={{ color: '#d97706', fontWeight: '700' }}>dangerous for good</span>.
                Help me see evil and step in. Thank you for breaking my chains and setting me free to be
                <span style={{ color: '#d97706', fontWeight: '700' }}> courageous and bold</span>!
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="content-section">
            <h2>Coming Soon</h2>
            <p>This section is under development</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Home Content Container - Scrollable content area */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        touchAction: 'pan-y'
      }}>
        <div className="app-container" style={{marginTop: '0', minHeight: '100%', paddingBottom: '20px'}}>
          {/* Band of Brothers Header */}
          <div style={{
            textAlign: 'center',
            padding: '20px 0',
            position: 'relative'
          }}>
            {/* Camo Pattern Background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(ellipse 80px 60px at 20% 30%, #3d4a3d 0%, transparent 50%),
                radial-gradient(ellipse 100px 70px at 70% 20%, #2d3a2d 0%, transparent 50%),
                radial-gradient(ellipse 90px 80px at 40% 70%, #4a5a4a 0%, transparent 50%),
                radial-gradient(ellipse 110px 65px at 85% 60%, #3a4a3a 0%, transparent 50%)
              `,
              opacity: 0.15,
              pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                marginTop: '0px'
              }}>
                <img
                  src="/bob_logo.png"
                  alt="Band of Brothers Logo"
                  style={{
                    width: '64px',
                    height: '64px',
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
                letterSpacing: '0.2em',
                marginBottom: '1rem'
              }}>
                BOOTCAMP
              </p>

              <div style={{
                height: '4px',
                background: 'linear-gradient(to right, transparent, #b45309, transparent)',
                opacity: 0.4,
                maxWidth: '250px',
                margin: '0 auto'
              }}></div>
            </div>
          </div>

          {renderContent()}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
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

      {/* Bottom Navigation - Independent */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={userProfile}
      />
    </>
  );
}

export default Home;