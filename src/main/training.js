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
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="container">
        <button className="back-button" onClick={handleBackToHome}>
          ←
        </button>
        
        <div className="header">
          <h1 className="title">Training Content</h1>
        </div>

        <div className="welcome">
          <p>Choose a training category to view available resources</p>
        </div>

        <div className="grid">
          {trainingCategories.map((category) => (
            <button
              key={category}
              className="button-category"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="icon">
                <img src="/assets/logo.jpg" alt="Team Inspire" />
              </div>
              <div className="text-content">
                <div className="text-title">{category}</div>
                <div className="text-subtitle">
                  Training materials and resources
                </div>
              </div>
              <div className="arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Content List View
  return (
    <div className="container">
      <button className="back-button" onClick={handleBackToCategories}>
        ←
      </button>
      
      <div className="header">
        <h1 className="title">Training Content</h1>
      </div>

      <div className="welcome">
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
        <div className="grid cards">
          {contentItems.map((item) => (
            <div
              key={item.id}
              className="card"
              onClick={() => handleContentClick(item.url)}
            >
              <div className="card-image">
                <img 
                  src={item.image_url || '/assets/logo.jpg'} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = '/assets/logo.jpg';
                  }}
                />
                {item.url && (
                  <div className="card-overlay">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <h3 className="text-title">{item.title}</h3>
                {item.description && (
                  <p className="text-description">{item.description}</p>
                )}
                <div className="meta">
                  <span className="badge">{item.category}</span>
                  {item.url && (
                    <span className="meta-item">
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

export default Training;