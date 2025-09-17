import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './content.css';

function Training() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const navigate = useNavigate();

  // Training categories matching admin system
  const trainingCategories = [
    'Setting appointments',
    'First appointment',
    'Preparing a plan',
    'Second appointment',
    'Investments',
    'Deliver Policy',
    'Leadership training',
    'Additional content'
  ];

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
  };

  const loadCategoryContent = async (category) => {
    setIsLoadingContent(true);
    try {
      const { data, error } = await supabase
        .from('training_content')
        .select('*')
        .eq('category', category)
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

  const handleCategoryClick = (category) => {
    window.scrollTo(0, 0);
    setSelectedCategory(category);
    loadCategoryContent(category);
  };

  const handleBackToCategories = () => {
    window.scrollTo(0, 0);
    setSelectedCategory(null);
    setContentItems([]);
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

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        overflow: 'hidden'
      }}>
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

        {/* Back Button - Fixed Position */}
        <button
          onClick={handleBackToHome}
          style={{
            position: 'fixed',
            top: '70px',
            left: '20px',
            zIndex: '1000',
            width: '36px',
            height: '36px',
            fontSize: '1.5rem',
            boxShadow: '0 2px 8px rgba(255, 0, 0, 0.2)',
            borderRadius: '50%',
            backgroundColor: '#ff0000',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ←
        </button>

        {/* Title - Fixed Position */}
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: '1000'
        }}>
          <h1 className="app-title" style={{margin: '0', fontSize: '2rem', whiteSpace: 'nowrap'}}>Training Content</h1>
        </div>

        {/* Scrollable Content Container */}
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '0',
          right: '0',
          bottom: '20px',
          overflowY: 'auto',
          overflowX: 'hidden',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className="app-container" style={{
            marginTop: '0',
            minHeight: '100%',
            paddingBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '25px',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            boxSizing: 'border-box'
          }}>

            <div className="content-section">
              <p>Choose a training category to view available resources</p>
            </div>

            <div className="training-categories">
              {trainingCategories.map((category) => (
                <button
                  key={category}
                  className="training-category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="training-category-icon">
                    <img src="/assets/logo.jpg" alt="Team Inspire" />
                  </div>
                  <div className="training-category-content">
                    <div className="training-category-title">{category}</div>
                    <div className="training-category-subtitle">
                      Training materials and resources
                    </div>
                  </div>
                  <div className="training-category-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Content List View
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      overflow: 'hidden'
    }}>
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

      {/* Back Button - Fixed Position */}
      <button
        onClick={handleBackToCategories}
        style={{
          position: 'fixed',
          top: '70px',
          left: '20px',
          zIndex: '1000',
          width: '36px',
          height: '36px',
          fontSize: '1.5rem',
          boxShadow: '0 2px 8px rgba(255, 0, 0, 0.2)',
          borderRadius: '50%',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ←
      </button>

      {/* Title - Fixed Position */}
      <div style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000'
      }}>
        <h1 className="app-title" style={{margin: '0', fontSize: '2rem', whiteSpace: 'nowrap'}}>Training Content</h1>
      </div>

      {/* Scrollable Content Container */}
      <div style={{
        position: 'fixed',
        top: '120px',
        left: '0',
        right: '0',
        bottom: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="app-container" style={{
          marginTop: '0',
          minHeight: '100%',
          paddingBottom: '20px',
          paddingLeft: '20px',
          paddingRight: '25px',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>

          <div className="content-section">
            <h2>{selectedCategory}</h2>
            <p>Training resources for {selectedCategory.toLowerCase()}</p>
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
              <p>There are no training materials available for this category yet.</p>
              <button
                className="button-primary"
                onClick={handleBackToCategories}
              >
                Browse Other Categories
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
                      <span className="badge">{item.category}</span>
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
      </div>
    </div>
  );
}

export default Training;