import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './content.css';

function NewRepStart() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      navigate('/', { replace: true });
      return;
    }

    setUser(session.user);
    setLoading(false);
    loadContent();
  };

  const loadContent = async () => {
    setIsLoadingContent(true);
    try {
      const { data, error } = await supabase
        .from('newrepstart_content')
        .select('*')
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

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleContentClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
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
    <div className="app-container">
      <button className="back-button" onClick={handleBackToHome}>
        ←
      </button>
      
      <h1 className="app-title">New Rep Start</h1>

      <div className="content-section">
        <h2>Getting Started Resources</h2>
        <p>Essential materials and training for new representatives</p>
      </div>

      {isLoadingContent ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading content...</p>
        </div>
      ) : contentItems.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="#666" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No Content Available</h3>
          <p>There are no new rep start materials available yet.</p>
          <button 
            className="button-primary"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="training-content-grid">
          {contentItems.map((item) => (
            <div
              key={item.id}
              className="training-content-card"
              onClick={() => handleContentClick(item.url)}
            >
              <div className="training-content-image">
                <img 
                  src={item.image_url || '/assets/logo.jpg'} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = '/assets/logo.jpg';
                  }}
                />
                {item.url && (
                  <div className="training-content-overlay">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="training-content-body">
                <h3 className="training-content-title">{item.title}</h3>
                {item.description && (
                  <p className="training-content-description">{item.description}</p>
                )}
                <div className="training-content-meta">
                  <span className="badge">New Rep Start</span>
                  {item.url && (
                    <span className="training-meta-item">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}

export default NewRepStart;