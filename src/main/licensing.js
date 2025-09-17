import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './content.css';

function Licensing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Life insurance license');
  const [licenseItems, setLicenseItems] = useState([]);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);
  const navigate = useNavigate();

  const licenseTabs = [
    'Life insurance license',
    'Securities license'
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadLicenseContent(activeTab);
    }
  }, [activeTab, user]);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      navigate('/', { replace: true });
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const loadLicenseContent = async (category) => {
    setIsLoadingLicenses(true);
    try {
      const { data, error } = await supabase
        .from('licensing_content')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLicenseItems(data || []);
    } catch (error) {
      console.error('Error loading licenses:', error);
      alert('Error loading licenses: ' + error.message);
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleLicenseItemClick = (url) => {
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
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      overflow: 'hidden',
      touchAction: 'none'
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
        <h1 className="app-title" style={{margin: '0', fontSize: '2rem'}}>Licensing</h1>
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
          paddingRight: '20px',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>

          <div className="content-section">
            <p>License requirements and study materials</p>
          </div>

          {/* License Tabs */}
          <div className="licensing-tabs">
            {licenseTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`licensing-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'Life insurance license' ? 'Life License' : 'Securities License'}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoadingLicenses ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p className="loading-text">Loading content...</p>
            </div>
          ) : licenseItems.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" fill="none" stroke="#666" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3>No Content Available</h3>
              <p>There are no materials available for this license type yet.</p>
            </div>
          ) : (
            <div className="licensing-grid">
              {licenseItems.map((item) => (
                <div
                  key={item.id}
                  className="licensing-card"
                  onClick={() => handleLicenseItemClick(item.url)}
                >
                  <div className="licensing-image">
                    <img
                      src={item.image_url || '/assets/logo.jpg'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = '/assets/logo.jpg';
                      }}
                    />
                    {item.url && (
                      <div className="licensing-overlay">
                        <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="licensing-content">
                    <h3 className="licensing-title">{item.title}</h3>
                    {item.description && (
                      <p className="licensing-description">{item.description}</p>
                    )}
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

export default Licensing;