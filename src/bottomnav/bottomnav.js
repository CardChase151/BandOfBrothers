import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './bottomnav.css';

function BottomNav({ activeTab, onTabChange, user }) {
  const [showMoreNav, setShowMoreNav] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.user_metadata?.IsAdmin === true;

  const handleNavClick = (tab) => {
    // Handle special navigation cases
    if (tab === 'admin') {
      navigate('/admin');
      setShowMoreNav(false);
      return;
    }

    if (tab === 'training') {
      navigate('/training');
      setShowMoreNav(false);
      return;
    }

    if (tab === 'schedule') {
      navigate('/schedule');
      setShowMoreNav(false);
      return;
    }

    if (tab === 'licensing') {
      navigate('/licensing');
      setShowMoreNav(false);
      return;
    }

    if (tab === 'chat') {
      navigate('/chat');
      setShowMoreNav(false);
      return;
    }
    
    if (tab !== 'more') {
      setShowMoreNav(false);
      onTabChange(tab);
    }
  };

  const handleMoreClick = () => {
    setShowMoreNav(!showMoreNav);
    // Don't call onTabChange for 'more' - it should only expand/collapse
  };

  return (
    <div className={`bottom-nav ${showMoreNav ? 'expanded' : ''}`}>
      {/* Main Navigation Row */}
      <div className="nav-row main-row">
        <button 
          onClick={() => handleNavClick('home')}
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="nav-label">Home</span>
        </button>

        <button 
          onClick={() => handleNavClick('notifications')}
          className={`nav-button ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="nav-label">Notifications</span>
        </button>

        <button 
          onClick={() => handleNavClick('schedule')}
          className={`nav-button ${activeTab === 'schedule' ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="nav-label">Schedule</span>
        </button>

        <button 
          onClick={() => handleNavClick('chat')}
          className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="nav-label">Chat</span>
        </button>

        <button 
          onClick={handleMoreClick}
          className={`nav-button ${showMoreNav ? 'active' : ''}`}
        >
          <svg className={`nav-icon chevron ${showMoreNav ? 'rotated' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="nav-label">More</span>
        </button>
      </div>

      {/* Expanded Navigation Row */}
      {showMoreNav && (
        <div className="nav-row expanded-row">
          <button 
            onClick={() => handleNavClick('licensing')}
            className={`nav-button ${activeTab === 'licensing' ? 'active' : ''}`}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="nav-label">Licensing</span>
          </button>

          <button 
            onClick={() => handleNavClick('training')}
            className={`nav-button ${activeTab === 'training' ? 'active' : ''}`}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="nav-label">Training</span>
          </button>

          <button 
            onClick={() => handleNavClick('calculator')}
            className={`nav-button ${activeTab === 'calculator' ? 'active' : ''}`}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
            </svg>
            <span className="nav-label">Calculator</span>
          </button>

          <button 
            onClick={() => handleNavClick('profile')}
            className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="nav-label">Profile</span>
          </button>

          {/* Admin button - only visible to admins */}
          {isAdmin ? (
            <button 
              onClick={() => handleNavClick('admin')}
              className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="nav-label">Admin</span>
            </button>
          ) : (
            /* Empty space to align with More button */
            <div className="nav-button-spacer"></div>
          )}
        </div>
      )}
    </div>
  );
}

export default BottomNav;