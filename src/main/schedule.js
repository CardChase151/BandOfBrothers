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
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="back-button" onClick={handleBackToHome}>
        ←
      </button>
      
      <div className="header">
        <h1 className="title">Schedule</h1>
      </div>

      <div className="welcome">
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
        <div className="grid">
          {scheduleItems.map((item) => (
            <div key={item.id} className="card list-item">
              <div className="icon">
                <img src="/assets/logo.jpg" alt="Team Inspire" />
              </div>
              
              <div className="card-content">
                {/* Title and Day */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                  <h3 className="text-title" style={{ flex: 1, lineHeight: 1.3, margin: 0 }}>{item.title}</h3>
                  {item.day_of_week && (
                    <span className="badge">{item.day_of_week}</span>
                  )}
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="text-description" style={{ margin: '0 0 1rem 0', WebkitLineClamp: 4, lineClamp: 4 }}>{item.description}</p>
                )}
                
                {/* Time Badge */}
                {item.start_time && item.end_time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4CAF50', fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '6px 10px', borderRadius: '6px', marginBottom: '1rem', width: 'fit-content' }}>
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
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="button-primary"
                        style={{ marginTop: '8px', flex: 1 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Join via Link
                      </a>
                    </div>
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

export default Schedule;