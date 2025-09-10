import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import './content.css';
import '../onboarding/onboarding.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, [navigate]);

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
    if (tab === 'home') {
      navigate('/home');
      return;
    }

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

    if (tab === 'chat') {
      navigate('/chat');
      return;
    }
    
    console.log(`Navigating to: ${tab}`);
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
      <div className="app-container">
        <h1 className="app-title">Team Ins<span className="brand-accent">p</span>ire</h1>
        
        <div className="profile-content">
          <div className="profile-section">
            <div className="profile-header">
              <h2>Profile</h2>
            </div>
            
            <div className="profile-info">
              <div className="profile-item">
                <label>Name:</label>
                <span>{userProfile?.first_name || ''} {userProfile?.last_name || ''}</span>
              </div>
              
              <div className="profile-item">
                <label>Email:</label>
                <span>{user?.email || ''}</span>
              </div>
              
              <div className="profile-item">
                <label>Role:</label>
                <span>{userProfile?.role || 'user'}</span>
              </div>
              
              <div className="profile-item">
                <label>Member Since:</label>
                <span>{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
            
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={userProfile}
      />
    </>
  );
}

export default Profile;