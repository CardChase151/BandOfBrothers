import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Mountain, Heart, Swords, Send, MessageSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import './prayer.css';

const Prayer = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('prayer');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const prayerRequests = [
    {
      id: 1,
      author: 'Marcus T.',
      anonymous: false,
      category: 'Addiction/Temptation',
      request: "Been clean for 6 days. Tonight the battle is fierce. The lies are loud. I need my brothers to stand with me right now.",
      timeAgo: '2 hours ago',
      prayerCount: 43,
      comments: 7
    },
    {
      id: 2,
      author: 'A Brother in the Fight',
      anonymous: true,
      category: 'Marriage/Relationships',
      request: "My wife told me she's not sure she loves me anymore. 12 years of marriage. Two kids. I've been passive, absent, and I see it now. I need God to show me how to fight for her. And I need strength not to run.",
      timeAgo: '5 hours ago',
      prayerCount: 87,
      comments: 15
    },
    {
      id: 3,
      author: 'James R.',
      anonymous: false,
      category: 'Work/Calling',
      request: "Tomorrow I'm walking away from the corporate job to start the business God's been pressing on my heart for 2 years. Terrified. Pray I don't turn back.",
      timeAgo: '1 day ago',
      prayerCount: 124,
      comments: 23
    },
    {
      id: 4,
      author: 'David L.',
      anonymous: false,
      category: 'Spiritual Warfare',
      request: "Attacks have been relentless this week. I feel like I'm under siege. Need prayer for protection and strength.",
      timeAgo: '4 hours ago',
      prayerCount: 38,
      comments: 9
    },
    {
      id: 5,
      author: 'A Brother in the Fight',
      anonymous: true,
      category: 'Addiction/Temptation',
      request: "Relapsed after 90 days. The shame is crushing me. I know God's grace is enough but I can't shake this feeling. Need brothers who understand.",
      timeAgo: '6 hours ago',
      prayerCount: 67,
      comments: 18
    },
    {
      id: 6,
      author: 'Michael S.',
      anonymous: false,
      category: 'Marriage/Relationships',
      request: "Just found out we're expecting our first child. I'm terrified I'll fail as a father like mine did. Pray for courage and wisdom.",
      timeAgo: '8 hours ago',
      prayerCount: 92,
      comments: 21
    },
    {
      id: 7,
      author: 'A Brother in the Fight',
      anonymous: true,
      category: 'Work/Calling',
      request: "Been unemployed for 5 months. Bills piling up. Family stressed. Starting to doubt God sees me. Need to know He hasn't forgotten.",
      timeAgo: '12 hours ago',
      prayerCount: 156,
      comments: 34
    },
    {
      id: 8,
      author: 'Christopher P.',
      anonymous: false,
      category: 'Spiritual Warfare',
      request: "Every time I try to pray or read scripture, my mind goes blank or I get overwhelmed with anger. This isn't normal. Fighting something bigger.",
      timeAgo: '1 day ago',
      prayerCount: 78,
      comments: 16
    }
  ];

  const filteredPrayers = prayerRequests.filter(prayer => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'addiction') return prayer.category === 'Addiction/Temptation';
    if (activeFilter === 'marriage') return prayer.category === 'Marriage/Relationships';
    if (activeFilter === 'calling') return prayer.category === 'Work/Calling';
    if (activeFilter === 'warfare') return prayer.category === 'Spiritual Warfare';
    return true;
  });

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/', { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) setUserProfile(profile);
      setLoading(false);
    } catch (error) {
      navigate('/', { replace: true });
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/home');
    else if (tab === 'training') navigate('/training');
    else if (tab === 'schedule') navigate('/schedule');
    else if (tab === 'licensing') navigate('/licensing');
    else if (tab === 'chat') navigate('/chat');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="prayer-container">
        {/* Header */}
        <div className="prayer-header">
          <h1 className="prayer-title">WAR ROOM</h1>
          <p className="prayer-subtitle">Your brothers are standing with you in the fight</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn primary">
            <Send size={20} />
            I Need Prayer
          </button>
          <button className="action-btn secondary">
            <Shield size={20} />
            Stand in the Gap
          </button>
        </div>

        {/* Filter Pills */}
        <div className="filter-container">
          <button
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all' ? 'filter-pill active' : 'filter-pill'}
          >
            All Battles
          </button>
          <button
            onClick={() => setActiveFilter('addiction')}
            className={activeFilter === 'addiction' ? 'filter-pill active' : 'filter-pill'}
          >
            <Swords size={12} />
            Addiction
          </button>
          <button
            onClick={() => setActiveFilter('marriage')}
            className={activeFilter === 'marriage' ? 'filter-pill active' : 'filter-pill'}
          >
            <Heart size={12} />
            Marriage
          </button>
          <button
            onClick={() => setActiveFilter('calling')}
            className={activeFilter === 'calling' ? 'filter-pill active' : 'filter-pill'}
          >
            <Mountain size={12} />
            Calling
          </button>
          <button
            onClick={() => setActiveFilter('warfare')}
            className={activeFilter === 'warfare' ? 'filter-pill active' : 'filter-pill'}
          >
            <Flame size={12} />
            Warfare
          </button>
        </div>

        {/* Prayer Feed */}
        <div className="prayer-feed">
          {filteredPrayers.map((prayer) => (
            <div key={prayer.id} className="prayer-card">
              <div className="card-header">
                <div className="author-info">
                  <div className="avatar">
                    {prayer.anonymous ? (
                      <Shield size={20} className="avatar-icon" />
                    ) : (
                      <span className="avatar-letter">{prayer.author.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="author-name">
                      {prayer.anonymous ? 'A Brother in the Fight' : prayer.author}
                    </div>
                    <div className="time-ago">{prayer.timeAgo}</div>
                  </div>
                </div>
                <div className="category-tag">
                  <span className="category-text">{prayer.category.split('/')[0]}</span>
                </div>
              </div>

              <p className="prayer-text">{prayer.request}</p>

              <div className="card-actions">
                <button className="pray-btn">
                  <Shield size={16} />
                  I'm Praying
                </button>
                <div className="prayer-stats">
                  <Shield size={16} />
                  <span className="stat-num">{prayer.prayerCount}</span>
                  <span className="stat-text">brothers praying</span>
                </div>
                <button className="comment-btn">
                  <MessageSquare size={16} />
                  <span>{prayer.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="prayer-footer">
          <a href="https://appcatalyst.org" target="_blank" rel="noopener noreferrer">
            Built by AppCatalyst
          </a>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} user={userProfile} />
    </>
  );
};

export default Prayer;
