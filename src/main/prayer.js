import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Mountain, Heart, Swords, Send, MessageSquare, X, ArrowLeft, Trash2, Edit3, Check, List, FileText, MoreHorizontal } from 'lucide-react';
import { supabase } from '../supabaseClient';
import BottomNav from '../bottomnav/bottomnav';
import Comments from './comments';
import './prayer.css';

const Prayer = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('prayer');
  const [activeFilter, setActiveFilter] = useState('all');
  const [prayerFeedTab, setPrayerFeedTab] = useState('all'); // 'all', 'mine', or 'list'
  const [prayerRequests, setPrayerRequests] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = initial, 2 = create custom
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customRequest, setCustomRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [prayerToEdit, setPrayerToEdit] = useState(null);
  const [editedRequest, setEditedRequest] = useState('');
  const [showListToast, setShowListToast] = useState(false);
  const [listToastMessage, setListToastMessage] = useState('');
  const [toastPosition, setToastPosition] = useState({ x: 0, y: 0 });
  const [showComments, setShowComments] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [prayerToUpdate, setPrayerToUpdate] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelinePrayer, setTimelinePrayer] = useState(null);
  const [prayerUpdates, setPrayerUpdates] = useState([]);
  const [showPraiseModal, setShowPraiseModal] = useState(false);
  const [prayerToPraise, setPrayerToPraise] = useState(null);
  const [praiseText, setPraiseText] = useState('');
  const [showEditOptionsModal, setShowEditOptionsModal] = useState(false);
  const [prayerForEditOptions, setPrayerForEditOptions] = useState(null);
  const [showEditUpdateModal, setShowEditUpdateModal] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState(null);
  const [editedUpdateText, setEditedUpdateText] = useState('');

  const navigate = useNavigate();

  const categories = [
    { id: 'addiction', label: 'Addiction/Temptation', icon: Swords },
    { id: 'relationships', label: 'Relationships/Marriage/Family/Friends', icon: Heart },
    { id: 'calling', label: 'Calling/Work/Business/Ministry', icon: Mountain },
    { id: 'warfare', label: 'Spiritual Warfare', icon: Flame },
    { id: 'praise', label: 'Praise', icon: Shield }
  ];

  const filteredPrayers = prayerRequests.filter(prayer => {
    // Filter by tab
    if (prayerFeedTab === 'mine' && prayer.user_id !== userProfile?.id) {
      return false;
    }
    if (prayerFeedTab === 'list' && !prayer.is_on_list) {
      return false;
    }

    // Filter by category
    if (activeFilter === 'all') return true;
    if (activeFilter === 'addiction') return prayer.category === 'Addiction/Temptation';
    if (activeFilter === 'relationships') return prayer.category === 'Relationships/Marriage/Family/Friends' || prayer.category === 'Relationships' || prayer.category === 'Marriage/Relationships';
    if (activeFilter === 'calling') return prayer.category === 'Calling/Work/Business/Ministry' || prayer.category === 'Work/Calling';
    if (activeFilter === 'warfare') return prayer.category === 'Spiritual Warfare';
    if (activeFilter === 'praise') return prayer.category === 'Praise';
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

      if (profile) {
        setUserProfile(profile);
        fetchPrayerRequests();
      }
      setLoading(false);
    } catch (error) {
      navigate('/', { replace: true });
    }
  };

  const fetchPrayerRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch prayers
      const { data: prayers, error: prayersError } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('last_updated_at', { ascending: false });

      if (prayersError) throw prayersError;

      // Fetch user's prayer interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('prayer_interactions')
        .select('prayer_id, is_on_list, created_at')
        .eq('user_id', session?.user?.id);

      if (interactionsError) throw interactionsError;

      // Create maps of prayer interactions
      const interactionsMap = new Map();
      interactions?.forEach(i => {
        interactionsMap.set(i.prayer_id, {
          is_on_list: i.is_on_list,
          prayed_at: i.created_at
        });
      });

      // Add has_prayed and is_on_list flags to each prayer
      const prayersWithStatus = prayers?.map(prayer => {
        const interaction = interactionsMap.get(prayer.id);
        const prayedAt = interaction?.prayed_at ? new Date(interaction.prayed_at) : null;
        const lastUpdated = prayer.last_updated_at ? new Date(prayer.last_updated_at) : new Date(prayer.created_at);

        // User has prayed if interaction exists AND they prayed after the last update
        const hasPrayedSinceUpdate = prayedAt && prayedAt >= lastUpdated;

        return {
          ...prayer,
          has_prayed: hasPrayedSinceUpdate,
          is_on_list: interaction?.is_on_list || false,
          ever_prayed: !!interaction // Track if they've ever prayed for this
        };
      }) || [];

      setPrayerRequests(prayersWithStatus);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    }
  };

  const openPrayerModal = () => {
    setShowModal(true);
    setModalStep(1);
    setIsAnonymous(false);
    setSelectedCategory('');
    setCustomRequest('');
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep(1);
    setIsAnonymous(false);
    setSelectedCategory('');
    setCustomRequest('');
  };

  const handleUrgentPrayer = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const authorName = userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile?.name || 'Anonymous';

      const { error } = await supabase
        .from('prayer_requests')
        .insert([{
          user_id: session.user.id,
          author_name: authorName,
          is_anonymous: isAnonymous,
          category: categories.find(c => c.id === selectedCategory)?.label || selectedCategory,
          request_text: null,
          is_urgent: true,
          prayer_count: 0,
          comment_count: 0
        }]);

      if (error) throw error;

      await fetchPrayerRequests();
      closeModal();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error posting prayer:', error);
      alert('Failed to post prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomPrayer = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    if (!customRequest.trim()) {
      alert(selectedCategory === 'praise' ? 'Please enter your praise report' : 'Please enter your prayer request');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const authorName = userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile?.name || 'Anonymous';

      const { error } = await supabase
        .from('prayer_requests')
        .insert([{
          user_id: session.user.id,
          author_name: authorName,
          is_anonymous: isAnonymous,
          category: categories.find(c => c.id === selectedCategory)?.label || selectedCategory,
          request_text: customRequest,
          is_urgent: false,
          prayer_count: 0,
          comment_count: 0,
          is_completed: selectedCategory === 'praise' // Mark as completed if it's a praise report
        }]);

      if (error) throw error;

      await fetchPrayerRequests();
      closeModal();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error posting prayer:', error);
      alert('Failed to post prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/home');
    else if (tab === 'training') navigate('/training');
    else if (tab === 'schedule') navigate('/schedule');
    else if (tab === 'licensing') navigate('/licensing');
    else if (tab === 'chat') navigate('/chat');
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const openDeleteModal = (prayerId) => {
    setPrayerToDelete(prayerId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setPrayerToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeletePrayer = async () => {
    if (!prayerToDelete) return;

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', prayerToDelete);

      if (error) throw error;

      await fetchPrayerRequests();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting prayer:', error);
      alert('Failed to delete prayer request');
    }
  };

  const openEditOptionsModal = (prayer) => {
    setPrayerForEditOptions(prayer);
    setShowEditOptionsModal(true);
  };

  const closeEditOptionsModal = () => {
    setPrayerForEditOptions(null);
    setShowEditOptionsModal(false);
  };

  const openEditModal = (prayer) => {
    setPrayerToEdit(prayer);
    setEditedRequest(prayer.request_text || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setPrayerToEdit(null);
    setEditedRequest('');
    setShowEditModal(false);
  };

  const openUpdateModal = (prayer) => {
    setPrayerToUpdate(prayer);
    setUpdateText('');
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setPrayerToUpdate(null);
    setUpdateText('');
    setShowUpdateModal(false);
  };

  const openTimeline = async (prayer) => {
    setTimelinePrayer(prayer);

    // Fetch all updates for this prayer
    const { data, error } = await supabase
      .from('prayer_updates')
      .select('*')
      .eq('prayer_id', prayer.id)
      .order('update_number', { ascending: true });

    if (!error) {
      setPrayerUpdates(data || []);
    }

    setShowTimeline(true);
  };

  const closeTimeline = () => {
    setTimelinePrayer(null);
    setPrayerUpdates([]);
    setShowTimeline(false);
  };

  const openPraiseModal = (prayer) => {
    setPrayerToPraise(prayer);
    setPraiseText('');
    setShowPraiseModal(true);
  };

  const closePraiseModal = () => {
    setPrayerToPraise(null);
    setPraiseText('');
    setShowPraiseModal(false);
  };

  const handlePraiseReport = async () => {
    if (!prayerToPraise || !praiseText.trim()) {
      alert('Please enter your praise report');
      return;
    }

    setSubmitting(true);
    try {
      const nextUpdateNumber = (prayerToPraise.update_count || 0) + 1;

      // Add the praise report as an update
      const { error: updateError } = await supabase
        .from('prayer_updates')
        .insert({
          prayer_id: prayerToPraise.id,
          user_id: userProfile.id,
          update_text: praiseText.trim(),
          update_number: nextUpdateNumber
        });

      if (updateError) throw updateError;

      // Mark prayer as complete and change category to Praise
      const { error: prayerError } = await supabase
        .from('prayer_requests')
        .update({
          category: 'Praise',
          is_completed: true
        })
        .eq('id', prayerToPraise.id);

      if (prayerError) throw prayerError;

      await fetchPrayerRequests();
      closePraiseModal();
      closeTimeline();
    } catch (error) {
      console.error('Error adding praise report:', error);
      alert('Failed to add praise report');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUpdateModal = (update) => {
    setUpdateToEdit(update);
    setEditedUpdateText(update.update_text);
    setShowEditUpdateModal(true);
  };

  const closeEditUpdateModal = () => {
    setUpdateToEdit(null);
    setEditedUpdateText('');
    setShowEditUpdateModal(false);
  };

  const handleEditUpdate = async () => {
    if (!updateToEdit || !editedUpdateText.trim()) {
      alert('Please enter update text');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_updates')
        .update({ update_text: editedUpdateText.trim() })
        .eq('id', updateToEdit.id);

      if (error) throw error;

      // Refresh timeline
      const { data } = await supabase
        .from('prayer_updates')
        .select('*')
        .eq('prayer_id', timelinePrayer.id)
        .order('update_number', { ascending: true });

      if (data) {
        setPrayerUpdates(data);
      }

      await fetchPrayerRequests();
      closeEditUpdateModal();
    } catch (error) {
      console.error('Error editing update:', error);
      alert('Failed to edit update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;

    try {
      const { error } = await supabase
        .from('prayer_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;

      // Refresh timeline
      const { data } = await supabase
        .from('prayer_updates')
        .select('*')
        .eq('prayer_id', timelinePrayer.id)
        .order('update_number', { ascending: true });

      if (data) {
        setPrayerUpdates(data);
      }

      await fetchPrayerRequests();
    } catch (error) {
      console.error('Error deleting update:', error);
      alert('Failed to delete update');
    }
  };

  const handleUpdatePrayer = async () => {
    if (!prayerToEdit || !editedRequest.trim()) {
      alert('Please enter your prayer request');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          request_text: editedRequest,
          updated_at: new Date().toISOString()
        })
        .eq('id', prayerToEdit.id);

      if (error) throw error;

      await fetchPrayerRequests();
      closeEditModal();
    } catch (error) {
      console.error('Error updating prayer:', error);
      alert('Failed to update prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!prayerToUpdate || !updateText.trim()) {
      alert('Please enter your update');
      return;
    }

    setSubmitting(true);
    try {
      const nextUpdateNumber = (prayerToUpdate.update_count || 0) + 1;

      const { error } = await supabase
        .from('prayer_updates')
        .insert({
          prayer_id: prayerToUpdate.id,
          user_id: userProfile.id,
          update_text: updateText.trim(),
          update_number: nextUpdateNumber
        });

      if (error) throw error;

      await fetchPrayerRequests();
      closeUpdateModal();
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePrayer = async (prayerId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if already prayed since last update
      const prayer = prayerRequests.find(p => p.id === prayerId);
      if (prayer?.has_prayed) {
        // Already praying - don't increment again
        return;
      }

      // Insert a new prayer interaction
      // The trigger will increment prayer_count automatically
      const { error } = await supabase
        .from('prayer_interactions')
        .insert([{
          prayer_id: prayerId,
          user_id: session.user.id,
          is_on_list: false
        }]);

      if (error) throw error;

      await fetchPrayerRequests();
    } catch (error) {
      console.error('Error toggling prayer:', error);
      alert('Failed to update prayer status');
    }
  };

  const toggleList = async (prayerId, event) => {
    // Capture position immediately before any async operations
    let position = { x: window.innerWidth / 2, y: 100 }; // default center
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2 + 30, // centered horizontally + 30px to the right
        y: rect.top - 10 // 10px above the button
      };
      console.log('Toast position:', position);
    } else {
      console.log('No event or currentTarget available');
    }
    setToastPosition(position);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const prayer = prayerRequests.find(p => p.id === prayerId);
      const wasOnList = prayer?.is_on_list;

      if (wasOnList) {
        // Remove from list
        const { error } = await supabase
          .from('prayer_interactions')
          .update({ is_on_list: false })
          .eq('prayer_id', prayerId)
          .eq('user_id', session.user.id);

        if (error) throw error;

        setListToastMessage('Removed');
      } else {
        // Check if interaction exists
        const { data: existing, error: fetchError } = await supabase
          .from('prayer_interactions')
          .select('id')
          .eq('prayer_id', prayerId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('prayer_interactions')
            .update({ is_on_list: true })
            .eq('prayer_id', prayerId)
            .eq('user_id', session.user.id);

          if (error) throw error;
        } else {
          // Create new interaction with list flag
          const { error } = await supabase
            .from('prayer_interactions')
            .insert([{
              prayer_id: prayerId,
              user_id: session.user.id,
              is_on_list: true
            }]);

          if (error) throw error;
        }

        setListToastMessage('Added to list');
      }

      // Show toast immediately
      setShowListToast(true);

      // Start fetch in background
      fetchPrayerRequests();

      // Hide toast after delay
      setTimeout(() => {
        setShowListToast(false);
      }, 1500);
    } catch (error) {
      console.error('Error toggling list:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      alert(`Failed to update prayer list: ${error.message || 'Unknown error'}`);
    }
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
          <button className="action-btn primary" onClick={openPrayerModal}>
            <Send size={20} />
            I Need Prayer
          </button>
          <button className="action-btn secondary">
            <Shield size={20} />
            Stand in the Gap
          </button>
        </div>

        {/* Prayer Feed Tabs */}
        <div className="prayer-feed-tabs">
          <button
            onClick={() => setPrayerFeedTab('all')}
            className={prayerFeedTab === 'all' ? 'feed-tab active' : 'feed-tab'}
          >
            All Prayers
          </button>
          <button
            onClick={() => setPrayerFeedTab('mine')}
            className={prayerFeedTab === 'mine' ? 'feed-tab active' : 'feed-tab'}
          >
            My Prayers
          </button>
          <button
            onClick={() => setPrayerFeedTab('list')}
            className={prayerFeedTab === 'list' ? 'feed-tab active' : 'feed-tab'}
          >
            My List
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
            onClick={() => setActiveFilter('relationships')}
            className={activeFilter === 'relationships' ? 'filter-pill active' : 'filter-pill'}
          >
            <Heart size={12} />
            Relationships
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
          <button
            onClick={() => setActiveFilter('praise')}
            className={activeFilter === 'praise' ? 'filter-pill active' : 'filter-pill'}
          >
            <Shield size={12} />
            Praise
          </button>
        </div>

        {/* Prayer Feed */}
        <div className="prayer-feed">
          {filteredPrayers.map((prayer) => {
            const isMyPrayer = prayer.user_id === userProfile?.id;
            return (
              <div key={prayer.id} className="prayer-card">
                <div className="card-header">
                  <div className="author-info">
                    <div className="avatar">
                      {prayer.is_anonymous ? (
                        <span className="avatar-letter">B</span>
                      ) : (
                        <span className="avatar-letter">{prayer.author_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>
                      <div className="author-name">
                        {prayer.is_anonymous ? 'Brother in Christ' : prayer.author_name}
                        {prayer.update_count > 0 && !prayer.has_prayed && (
                          <span className="update-badge-inline">New Update</span>
                        )}
                        {isMyPrayer && prayer.is_anonymous && (
                          <span className="my-prayer-badge">Your prayer</span>
                        )}
                        {isMyPrayer && !prayer.is_anonymous && (
                          <span className="my-prayer-badge">Your prayer</span>
                        )}
                      </div>
                      <div className="time-ago">{getTimeAgo(prayer.created_at)}</div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="category-tag">
                      <span className="category-text">{prayer.category.split('/')[0]}</span>
                    </div>
                    {isMyPrayer && (
                      <div className="prayer-actions">
                        {!prayer.is_urgent && !prayer.is_completed && (
                          <button
                            className="edit-prayer-btn"
                            onClick={() => openEditOptionsModal(prayer)}
                            title="Edit prayer or add update"
                          >
                            <Edit3 size={18} />
                          </button>
                        )}
                        <button
                          className="delete-prayer-btn"
                          onClick={() => openDeleteModal(prayer.id)}
                          title="Delete prayer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              <div className="prayer-text-container">
                {isMyPrayer && (
                  <button
                    className="notepad-btn-inline"
                    onClick={() => openTimeline(prayer)}
                    title="View prayer story"
                  >
                    <FileText size={16} />
                  </button>
                )}
                <p className="prayer-text">
                  {prayer.latest_update_text || (prayer.is_urgent
                    ? "I need urgent prayer right now. Please stand with me in this battle."
                    : prayer.request_text)}
                </p>
              </div>

              {prayer.update_count > 0 && (
                <div className="original-preview">
                  <span className="original-label">Original: </span>
                  <span className="original-text">
                    {prayer.is_urgent ? (
                      "I need urgent prayer right now. Please stand with me in this battle."
                    ) : (
                      <>
                        {prayer.request_text?.substring(0, 50)}
                        {prayer.request_text?.length > 50 && '...'}
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="card-actions">
                <button
                  className={prayer.is_on_list ? 'list-btn active' : 'list-btn'}
                  onClick={(e) => toggleList(prayer.id, e)}
                  title={prayer.is_on_list ? 'Remove from list' : 'Add to list'}
                >
                  <List size={16} />
                </button>
                <button
                  className={prayer.has_prayed ? (prayer.is_completed ? 'pray-btn praise-active' : 'pray-btn active') : (prayer.is_completed ? 'pray-btn praise-btn' : 'pray-btn')}
                  onClick={() => togglePrayer(prayer.id)}
                >
                  {prayer.is_completed ? (
                    prayer.has_prayed ? (
                      <>
                        <Shield size={16} />
                        Jesus is King
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        Praise God
                      </>
                    )
                  ) : (
                    prayer.has_prayed ? (
                      <>
                        <Swords size={16} />
                        Praying
                      </>
                    ) : (
                      <>
                        {prayer.update_count > 0 && prayer.ever_prayed ? 'Pray for Update' : 'Add Your Prayer'}
                      </>
                    )
                  )}
                </button>
                <div className="prayer-stats">
                  <Shield size={16} />
                  <span className="stat-num">{prayer.prayer_count}</span>
                  <span className="stat-text">prayers from your brothers</span>
                </div>
                <button
                  className="comment-btn"
                  onClick={() => {
                    setSelectedPrayer(prayer);
                    setShowComments(true);
                  }}
                >
                  <MessageSquare size={16} />
                  <span>{prayer.comment_count}</span>
                </button>
              </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="prayer-footer">
          <a href="https://appcatalyst.org" target="_blank" rel="noopener noreferrer">
            Built by AppCatalyst
          </a>
        </div>

        {/* Prayer Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Step 1: Initial Selection */}
              {modalStep === 1 && (
                <>
                  <div className="modal-header">
                    <h2>Request Prayer</h2>
                    <button className="close-btn" onClick={closeModal}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="modal-body">
                    {/* Anonymous Toggle */}
                    <div className="toggle-section">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>Post anonymously</span>
                      </label>
                    </div>

                    {/* Category Selection */}
                    <div className="category-section">
                      <h3>Choose a category</h3>
                      {!selectedCategory ? (
                        <div className="category-grid">
                          {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <button
                                key={cat.id}
                                className="category-btn"
                                onClick={() => setSelectedCategory(cat.id)}
                              >
                                <Icon size={20} />
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="selected-category-compact">
                          {(() => {
                            const selected = categories.find(c => c.id === selectedCategory);
                            const Icon = selected.icon;
                            return (
                              <button
                                className="category-btn active"
                                onClick={() => setSelectedCategory('')}
                              >
                                <Icon size={20} />
                                <span>{selected.label}</span>
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Prayer Type Selection */}
                    {selectedCategory && (
                      <div className="prayer-type-section">
                        {selectedCategory === 'praise' ? (
                          <button
                            className="prayer-type-btn custom"
                            onClick={() => setModalStep(2)}
                            disabled={submitting}
                          >
                            <Shield size={20} />
                            <div>
                              <div className="btn-title">Create Praise Report</div>
                              <div className="btn-subtitle">Share how God has moved in your life</div>
                            </div>
                          </button>
                        ) : (
                          <>
                            <button
                              className="prayer-type-btn urgent"
                              onClick={handleUrgentPrayer}
                              disabled={submitting}
                            >
                              <Shield size={20} />
                              <div>
                                <div className="btn-title">I Need Urgent Prayer</div>
                                <div className="btn-subtitle">Post immediately - no details needed</div>
                              </div>
                            </button>

                            <button
                              className="prayer-type-btn custom"
                              onClick={() => setModalStep(2)}
                              disabled={submitting}
                            >
                              <Send size={20} />
                              <div>
                                <div className="btn-title">Create Prayer Request</div>
                                <div className="btn-subtitle">Add details about what you need prayer for</div>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Modal Step 2: Custom Prayer Request */}
              {modalStep === 2 && (
                <>
                  <div className="modal-header">
                    <button className="back-btn" onClick={() => setModalStep(1)}>
                      <ArrowLeft size={24} />
                    </button>
                    <h2>{selectedCategory === 'praise' ? 'Share Your Praise Report' : 'Share Your Request'}</h2>
                    <button className="close-btn" onClick={closeModal}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="modal-body">
                    {selectedCategory === 'praise' && (
                      <div className="praise-encouragement">
                        <p className="praise-scripture">
                          "And we know that in all things God works for the good of those who love him,
                          who have been called according to his purpose."
                        </p>
                        <p className="praise-ref">Romans 8:28</p>

                        <p className="praise-message">
                          While sometimes it's easy to praise, other times it's harder. Always do your best
                          to find God and praise Him in the result. Share your testimony of God's faithfulness
                          to encourage your brothers.
                        </p>
                      </div>
                    )}

                    <div className="selected-category-display">
                      {categories.find(c => c.id === selectedCategory)?.label}
                      {isAnonymous && ' • Anonymous'}
                    </div>

                    <textarea
                      className="prayer-textarea"
                      placeholder={selectedCategory === 'praise' ? 'How has God moved? Share your testimony...' : 'Share what you need prayer for...'}
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      rows={8}
                      autoFocus
                    />

                    <button
                      className="submit-prayer-btn"
                      onClick={handleCustomPrayer}
                      disabled={submitting || !customRequest.trim()}
                    >
                      {submitting ? 'Posting...' : (selectedCategory === 'praise' ? 'Share Praise Report' : 'Send Prayer Request')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="success-icon">
                <Shield size={48} />
              </div>
              <h2 className="success-title">Your brothers are standing with you</h2>
              <p className="success-message">Your urgent prayer request has been posted.</p>

              <div className="identity-section">
                <h3 className="identity-title">Affirm Your Identity</h3>
                <p className="scripture-text">
                  "No, in all these things we are more than conquerors through him who loved us."
                </p>
                <p className="scripture-ref">Romans 8:37</p>
              </div>

              <button
                className="success-close-btn"
                onClick={() => setShowSuccessModal(false)}
              >
                Amen
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-icon">
                <Trash2 size={48} />
              </div>
              <h2 className="delete-title">Delete Prayer Request?</h2>
              <p className="delete-message">
                Are you sure you want to delete this prayer? This action cannot be undone.
              </p>

              <div className="delete-actions">
                <button className="delete-cancel-btn" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button className="delete-confirm-btn" onClick={confirmDeletePrayer}>
                  Delete Prayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Options Modal */}
        {showEditOptionsModal && prayerForEditOptions && (
          <div className="modal-overlay" onClick={closeEditOptionsModal}>
            <div className="edit-options-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Choose Action</h2>
                <button className="close-btn" onClick={closeEditOptionsModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <button
                  className="prayer-type-btn custom"
                  onClick={() => {
                    closeEditOptionsModal();
                    openEditModal(prayerForEditOptions);
                  }}
                >
                  <Edit3 size={20} />
                  <div>
                    <div className="btn-title">Edit Prayer</div>
                    <div className="btn-subtitle">Edit the original prayer text</div>
                  </div>
                </button>

                <button
                  className="prayer-type-btn custom"
                  onClick={() => {
                    closeEditOptionsModal();
                    openTimeline(prayerForEditOptions);
                  }}
                >
                  <Send size={20} />
                  <div>
                    <div className="btn-title">Add Update</div>
                    <div className="btn-subtitle">Share progress on your prayer journey</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Prayer Modal */}
        {showEditModal && prayerToEdit && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Prayer Request</h2>
                <button className="close-btn" onClick={closeEditModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="selected-category-display">
                  {prayerToEdit.category}
                  {prayerToEdit.is_anonymous && ' • Anonymous'}
                </div>

                <textarea
                  className="prayer-textarea"
                  placeholder="Share what you need prayer for..."
                  value={editedRequest}
                  onChange={(e) => setEditedRequest(e.target.value)}
                  rows={8}
                  autoFocus
                />

                <button
                  className="submit-prayer-btn"
                  onClick={handleUpdatePrayer}
                  disabled={submitting || !editedRequest.trim()}
                >
                  {submitting ? 'Updating...' : 'Update Prayer Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List Toast Notification */}
        {showListToast && (
          <div
            className="list-toast"
            style={{
              left: `${toastPosition.x}px`,
              top: `${toastPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {listToastMessage}
          </div>
        )}

        {/* Comments Panel */}
        {showComments && selectedPrayer && (
          <Comments
            prayer={selectedPrayer}
            onClose={() => {
              setShowComments(false);
              setSelectedPrayer(null);
              fetchPrayerRequests(); // Refresh to update comment counts
            }}
            currentUser={userProfile}
          />
        )}

        {/* Add Update Modal */}
        {showUpdateModal && prayerToUpdate && (
          <div className="modal-overlay" onClick={closeUpdateModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Update</h2>
                <button className="close-btn" onClick={closeUpdateModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="original-prayer-context">
                  <span className="context-label">Original prayer:</span>
                  <p className="context-text">
                    {prayerToUpdate.is_urgent
                      ? "I need urgent prayer right now. Please stand with me in this battle."
                      : prayerToUpdate.request_text}
                  </p>
                </div>

                <label className="modal-label">Share your update</label>
                <textarea
                  className="modal-textarea"
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="How are things going? Share your progress..."
                  rows={6}
                  autoFocus
                />

                <p className="anonymous-info">
                  This update will {prayerToUpdate.is_anonymous ? 'remain anonymous' : 'show your name'},
                  same as the original prayer.
                </p>

                <button
                  className="submit-btn"
                  onClick={handleAddUpdate}
                  disabled={submitting || !updateText.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Praise Report Modal */}
        {showPraiseModal && prayerToPraise && (
          <div className="modal-overlay" onClick={closePraiseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Praise Report</h2>
                <button className="close-btn" onClick={closePraiseModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="praise-encouragement">
                  <p className="praise-scripture">
                    "And we know that in all things God works for the good of those who love him,
                    who have been called according to his purpose."
                  </p>
                  <p className="praise-ref">Romans 8:28</p>

                  <p className="praise-message">
                    While sometimes it's easy to praise, other times it's harder. Always do your best
                    to find God and praise Him in the result. This praise report will mark your prayer
                    journey as complete and move it to the Praise section as a testimony to God's faithfulness.
                  </p>
                </div>

                <div className="original-prayer-context">
                  <span className="context-label">Original prayer:</span>
                  <p className="context-text">
                    {prayerToPraise.is_urgent
                      ? "I need urgent prayer right now. Please stand with me in this battle."
                      : prayerToPraise.request_text}
                  </p>
                </div>

                <label className="modal-label">Share your praise report</label>
                <textarea
                  className="modal-textarea"
                  value={praiseText}
                  onChange={(e) => setPraiseText(e.target.value)}
                  placeholder="How has God moved? Share your testimony..."
                  rows={6}
                  autoFocus
                />

                <button
                  className="submit-btn praise-submit"
                  onClick={handlePraiseReport}
                  disabled={submitting || !praiseText.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Praise Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Update Modal */}
        {showEditUpdateModal && updateToEdit && (
          <div className="modal-overlay" onClick={closeEditUpdateModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Update</h2>
                <button className="close-btn" onClick={closeEditUpdateModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <label className="modal-label">Update text</label>
                <textarea
                  className="modal-textarea"
                  value={editedUpdateText}
                  onChange={(e) => setEditedUpdateText(e.target.value)}
                  rows={6}
                  autoFocus
                />

                <button
                  className="submit-btn"
                  onClick={handleEditUpdate}
                  disabled={submitting || !editedUpdateText.trim()}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Panel */}
        {showTimeline && timelinePrayer && (
          <div className="comments-overlay" onClick={closeTimeline}>
            <div className="comments-panel" onClick={(e) => e.stopPropagation()}>
              <div className="comments-prayer-header">
                <button className="comments-close-btn" onClick={closeTimeline}>
                  <X size={24} />
                </button>
                <div className="comments-prayer-info">
                  <div className="comments-prayer-avatar">
                    <span className="avatar-letter">
                      {timelinePrayer.is_anonymous ? 'B' : (timelinePrayer.author_name?.charAt(0) || '?')}
                    </span>
                  </div>
                  <div className="comments-prayer-details">
                    <div className="comments-prayer-author">
                      {timelinePrayer.is_anonymous ? 'Brother in Christ' : timelinePrayer.author_name}
                    </div>
                    <div className="comments-prayer-category">{timelinePrayer.category}</div>
                  </div>
                </div>
                <h3 className="timeline-title">Prayer Journey</h3>
                {timelinePrayer.user_id === userProfile?.id && !timelinePrayer.is_completed && (
                  <>
                    <button
                      className="timeline-add-btn"
                      onClick={() => {
                        closeTimeline();
                        openUpdateModal(timelinePrayer);
                      }}
                      title="Add new update"
                    >
                      <Send size={18} />
                      Add Update
                    </button>
                    <button
                      className="timeline-praise-btn"
                      onClick={() => {
                        closeTimeline();
                        openPraiseModal(timelinePrayer);
                      }}
                      title="Submit praise report"
                    >
                      <Shield size={18} />
                      Praise Report
                    </button>
                  </>
                )}
              </div>

              <div className="timeline-list">
                {/* Original Prayer */}
                <div className="timeline-item">
                  <div className="timeline-chapter">
                    <span className="chapter-badge">Chapter 1 (Original)</span>
                    <span className="chapter-time">{getTimeAgo(timelinePrayer.created_at)}</span>
                  </div>
                  <p className="timeline-text">
                    {timelinePrayer.is_urgent
                      ? "I need urgent prayer right now. Please stand with me in this battle."
                      : timelinePrayer.request_text}
                  </p>
                </div>

                {/* Updates */}
                {prayerUpdates.map((update, index) => {
                  const isLastUpdate = index === prayerUpdates.length - 1;
                  const isFinalChapter = isLastUpdate && timelinePrayer.is_completed;

                  return (
                    <div key={update.id} className="timeline-item">
                      <div className="timeline-chapter">
                        <span className={isFinalChapter ? "chapter-badge final-chapter" : "chapter-badge"}>
                          {isFinalChapter ? 'Final Chapter (Praise Report)' : `Chapter ${index + 2} (Update)`}
                        </span>
                        <span className="chapter-time">{getTimeAgo(update.created_at)}</span>
                      </div>
                      <p className="timeline-text">{update.update_text}</p>
                      {timelinePrayer.user_id === userProfile?.id && !isFinalChapter && (
                        <div className="timeline-item-actions">
                          <button
                            className="timeline-action-btn"
                            onClick={() => openEditUpdateModal(update)}
                            title="Edit update"
                          >
                            <Edit3 size={16} />
                            Edit
                          </button>
                          <button
                            className="timeline-action-btn delete"
                            onClick={() => handleDeleteUpdate(update.id)}
                            title="Delete update"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {prayerUpdates.length === 0 && (
                  <div className="timeline-empty">
                    <p>No updates yet. Add your first update to track your prayer journey.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} user={userProfile} />
    </>
  );
};

export default Prayer;
