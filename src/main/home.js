import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import './content.css';
import '../onboarding/onboarding.css';

function Home() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
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

    if (tab === 'calculator') {
      navigate('/calculator');
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
          <div className="home-content">
            {/* Logo and Welcome */}
            <div className="welcome-section">
              <h2 className="welcome-title">
                Welcome, {userProfile?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h2>
            </div>

            {/* VP Message Card */}
            <div className="vp-message-card">
              <h3 className="vp-message-title">
                Message from Leadership
              </h3>
              <p className="vp-names">
                Tom and Heidi Kellis!
              </p>
              
              <div className="vp-message-content" style={{ textAlign: 'center' }}>
                <p>
                  As an Executive VP of a billion-dollar corporation, making great money in my early 30's, I still felt trapped. No time freedom, no real freedom at all, and my 4 kids were growing up fast!
                </p>
                <p>
                  Then I was introduced to Primerica and I started my firm over 20 years ago and have never looked back. We've been blessed! My wife was able to home-school the kids and we have been able to travel the world, really enjoying life.
                </p>
                <p>
                  Now my wife and 2 of my kids have joined me in establishing this as a family business and we are in several states and growing!
                </p>
                <p className="vp-mission">
                  My mission statement has always been to glorify God by being an honest, loving, and caring leader who listens, teaches, and inspires those around me to reach their full potential!
                </p>
              </div>
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
      {/* Dynamic Bar Background - Black */}
      <div style={{
        backgroundColor: '#000000',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        height: '60px',
        zIndex: '999'
      }}></div>

      {/* New Rep Start Banner - Below dynamic bar */}
      <div onClick={handleNewRepStart} style={{
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '95%',
        margin: '0 auto 0 auto',
        fontWeight: '600',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '8px',
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000'
      }}>
        <span>New Rep Start</span>
        <span>→</span>
      </div>

      {/* Home Content Container - Scrollable content area */}
      <div style={{
        position: 'fixed',
        top: '120px',
        left: '0',
        right: '0',
        bottom: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        touchAction: 'pan-y'
      }}>
        <div className="app-container" style={{marginTop: '0', minHeight: '100%', paddingBottom: '20px'}}>
          <h1 className="app-title">Team Ins<span className="brand-accent">p</span>ire</h1>
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
                color: '#007bff',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#0056b3'}
              onMouseLeave={(e) => e.target.style.color = '#007bff'}
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