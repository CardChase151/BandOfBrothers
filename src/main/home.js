import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import './content.css';
import '../onboarding/onboarding.css';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        navigate('/', { replace: true });
        return;
      }

      if (!session) {
        navigate('/', { replace: true });
        return;
      }

      setUser(session.user);
      setLoading(false);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out');
    }
  };

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
    
    console.log(`Navigating to: ${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <img 
                src="/assets/logo.jpg" 
                alt="Team Inspire Logo"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '20px',
                  marginBottom: '2rem',
                  objectFit: 'cover',
                  border: '2px solid #333'
                }}
              />
              <h2 className="text-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                Welcome, {user?.user_metadata?.first_name || 'User'}!
              </h2>
            </div>

            {/* Welcome Message from VPs */}
            <div className="card" style={{ 
              maxWidth: '400px',
              width: 'calc(100% - 40px)',
              cursor: 'default',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 className="text-title" style={{ fontSize: '1.3rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                A Big Welcome from your Vice Presidents
              </h3>
              <p style={{ color: '#ff0000', fontSize: '1.1rem', margin: '0 0 1.5rem 0', fontWeight: 'bold', textAlign: 'center' }}>
                Tom and Heidi Kellis!
              </p>
              
              <div style={{ textAlign: 'left', color: '#ffffff', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <p style={{ margin: '0 0 1.2rem 0' }}>
                  As an Executive VP of a billion-dollar corporation, making great money in my early 30's, I still felt trapped. No time freedom, no real freedom at all, and my 4 kids were growing up fast!
                </p>
                <p style={{ margin: '0 0 1.2rem 0' }}>
                  Then I was introduced to Primerica and I started my firm over 20 years ago and have never looked back. We've been blessed! My wife was able to home-school the kids and we have been able to travel the world, really enjoying life.
                </p>
                <p style={{ margin: '0 0 1.2rem 0' }}>
                  Now my wife and 2 of my kids have joined me in establishing this as a family business and we are in several states and growing!
                </p>
                <p style={{ color: '#ff0000', margin: '1.5rem 0 0 0', fontStyle: 'italic', fontWeight: '500', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                  My mission statement has always been to glorify God by being an honest, loving, and caring leader who listens, teaches, and inspires those around me to reach their full potential!
                </p>
              </div>
            </div>
            
            <button className="button-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        );
      
      case 'notifications':
        return (
          <div className="welcome">
            <h2>Notifications</h2>
            <p>No new notifications</p>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="welcome">
            <h2>Schedule</h2>
            <p>Your schedule is empty</p>
          </div>
        );
      
      case 'chat':
        return (
          <div className="welcome">
            <h2>Chat</h2>
            <p>No active conversations</p>
          </div>
        );
      
      case 'licensing':
        return (
          <div className="welcome">
            <h2>Licensing</h2>
            <p>Your licenses and certifications</p>
          </div>
        );
      
      case 'calculator':
        return (
          <div className="welcome">
            <h2>Calculator</h2>
            <p>Financial calculator tools</p>
          </div>
        );
      
      case 'profile':
        return (
          <div className="welcome">
            <h2>Profile</h2>
            <p>Manage your profile settings</p>
          </div>
        );

      case 'admin':
        return (
          <div className="welcome">
            <h2>Admin Panel</h2>
            <div className="card" style={{ 
              maxWidth: '400px',
              width: '100%',
              cursor: 'default',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <p style={{ color: '#ff0000', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                🔒 Admin Access Only
              </p>
              <p className="text-subtitle">
                User management, system settings, and administrative tools
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="welcome">
            <h2>Coming Soon</h2>
            <p>This section is under development</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ 
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))'
      }}>
        <h1 className="title">Team Ins<span className="brand-accent">p</span>ire</h1>
        
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
      />
    </>
  );
}

export default Home;