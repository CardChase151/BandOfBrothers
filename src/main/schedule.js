import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './content.css';

function Schedule() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
    loadScheduleContent();
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

  const loadScheduleContent = async () => {
    setIsLoadingSchedule(true);
    try {
      const { data, error } = await supabase
        .from('schedule_content')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Sort by day of week (Monday first)
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const sortedData = (data || []).sort((a, b) => {
        const dayA = dayOrder.indexOf(a.day_of_week);
        const dayB = dayOrder.indexOf(b.day_of_week);
        
        if (dayA === dayB) {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          return (a.start_time || '').localeCompare(b.start_time || '');
        }
        
        return dayA - dayB;
      });
      
      setScheduleItems(sortedData);
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Error loading schedule: ' + error.message);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes}${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
        <h1 className="app-title" style={{margin: '0', fontSize: '2rem'}}>Schedule</h1>
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
        <p>Weekly meetings and training sessions</p>
      </div>

      {isLoadingSchedule ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading schedule...</p>
        </div>
      ) : scheduleItems.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="#666" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3>No Events Scheduled</h3>
          <p>There are no scheduled events at this time. Check back later for updates.</p>
        </div>
      ) : (
        <div className="schedule-grid" style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          {scheduleItems.map((item) => (
            <div key={item.id} className="schedule-card" style={{
              maxWidth: '100%',
              width: '100%',
              minWidth: '0',
              overflowX: 'hidden'
            }}>
              <div className="schedule-icon">
                <img src="/assets/logo.jpg" alt="Team Inspire" />
              </div>
              
              <div className="schedule-content">
                {/* Title and Day */}
                <div className="schedule-header">
                  <h3 className="schedule-title">{item.title}</h3>
                  {item.day_of_week && (
                    <span className="badge">{item.day_of_week}</span>
                  )}
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="schedule-description">{item.description}</p>
                )}
                
                {/* Time Badge */}
                {item.start_time && item.end_time && (
                  <div className="time-badge">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    {formatTimeRange(item.start_time, item.end_time)}
                  </div>
                )}

                {/* Meeting Details Box */}
                <div className="details-box">
                  {item.meeting_id && (
                    <div className="detail-row">
                      <span className="detail-label">Meeting ID:</span>
                      <span className="detail-value">{item.meeting_id}</span>
                    </div>
                  )}
                  
                  {item.meeting_password && (
                    <div className="detail-row">
                      <span className="detail-label">Password:</span>
                      <span className="detail-value">{item.meeting_password}</span>
                    </div>
                  )}
                  
                  {item.url && (
                    <div className="detail-row">
                      <button 
                        onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                        className="join-zoom-button"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Zoom Meeting
                      </button>
                    </div>
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

export default Schedule;