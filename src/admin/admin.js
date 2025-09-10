import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './admin.css';

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState('--');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    loadUserCount();
  }, []);

  const checkUser = async () => {
    // Check if user is logged in and is admin
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      navigate('/home', { replace: true });
      return;
    }

    // Get user profile from users table to check admin role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      navigate('/home', { replace: true });
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const loadUserCount = async () => {
    try {
      // Use RPC function to get user count
      const { data, error } = await supabase.rpc('get_user_count');

      if (error) {
        console.error('Error loading user count:', error);
        setTotalUsers('Error');
      } else {
        setTotalUsers(data || 0);
      }
    } catch (error) {
      console.error('Error loading user count:', error);
      setTotalUsers('Error');
    }
  };

  const handleManageContent = (contentType) => {
    // Navigate to admin2.js with the content type
    navigate('/admin-manage', { 
      state: { 
        contentType: contentType,
        tableName: `${contentType}_content`
      }
    });
  };

  const goBack = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">
        Team Ins<span className="brand-accent">p</span>ire Admin
      </h1>
      
      <div className="admin-welcome">
        <div className="admin-lock-icon">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user?.user_metadata?.first_name || 'Admin'}</p>
        <p className="admin-subtitle">Manage app content and settings</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-number">{totalUsers}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
      </div>

      <div className="admin-menu">
        <h3>Content Management</h3>
        
        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('home')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Home Screen</div>
            <div className="admin-menu-desc">Manage home screen content and announcements</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>

        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('training')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Training Content</div>
            <div className="admin-menu-desc">Manage training videos and materials</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>

        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('licensing')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Licensing</div>
            <div className="admin-menu-desc">Manage licensing content and resources</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>

        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('schedule')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Schedule</div>
            <div className="admin-menu-desc">Manage events and scheduling content</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>

        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('chat')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Chat Management</div>
            <div className="admin-menu-desc">Manage user chat permissions</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>

        <button 
          className="admin-menu-button"
          onClick={() => handleManageContent('notifications')}
        >
          <div className="admin-menu-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div className="admin-menu-content">
            <div className="admin-menu-title">Notification Management</div>
            <div className="admin-menu-desc">Manage notifications and announcements</div>
          </div>
          <div className="admin-menu-arrow">→</div>
        </button>
      </div>

      <button className="admin-back-button" onClick={goBack}>
        ← Back to App
      </button>
    </div>
  );
}

export default Admin;