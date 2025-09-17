import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ImageUpload from './ImageUpload';
import './admin.css';

function Admin2() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get content type and table name from navigation state
  const contentType = location.state?.contentType || 'home';
  const tableName = location.state?.tableName || 'home_content';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    category: '',
    start_time: '',
    end_time: '',
    sort_order: 0
  });

  // Category definitions based on content type
  const getCategoriesForType = (type) => {
    switch (type) {
      case 'training':
        return [
          'Setting appointments',
          'First appointment',
          'Preparing a plan',
          'Second appointment',
          'Investments',
          'Deliver Policy',
          'Leadership training',
          'Additional content'
        ];
      case 'licensing':
        return [
          'Life insurance license',
          'Securities license'
        ];
      default:
        return ['General'];
    }
  };

  useEffect(() => {
    checkUser();
    if (contentType === 'chat') {
      loadUsers();
    } else {
      loadContent();
      setCategories(getCategoriesForType(contentType));
    }
  }, [contentType]);

  const checkUser = async () => {
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

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Error loading content: ' + error.message);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, can_create_chats, can_send_messages, team_inspire_enabled')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users: ' + error.message);
    }
  };

  const toggleUserPermission = async (userId, field) => {
    try {
      const currentUser = users.find(u => u.id === userId);
      const newValue = !currentUser[field];

      const { error } = await supabase
        .from('users')
        .update({ [field]: newValue })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, [field]: newValue } : u
      ));
    } catch (error) {
      console.error('Error updating user permission:', error);
      alert('Error updating permission: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    // Validate times for schedule content
    if (contentType === 'schedule') {
      if (!formData.start_time || !formData.end_time) {
        alert('Start time and end time are required for schedule items');
        return;
      }
      if (formData.start_time >= formData.end_time) {
        alert('Start time must be before end time');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare data - only include time fields for schedule
      const submitData = { ...formData };
      if (contentType !== 'schedule') {
        delete submitData.start_time;
        delete submitData.end_time;
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from(tableName)
          .update(submitData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase
          .from(tableName)
          .insert([submitData]);

        if (error) throw error;
      }

      // Reset form and reload content
      resetForm();
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content: ' + error.message);
    }

    setIsSubmitting(false);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      url: item.url || '',
      image_url: item.image_url || '',
      category: item.category || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      sort_order: item.sort_order || 0
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: false })
        .eq('id', item.id);

      if (error) throw error;
      
      loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      image_url: '',
      category: '',
      start_time: '',
      end_time: '',
      sort_order: 0
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const goBack = () => {
    navigate('/admin');
  };

  const getContentTypeTitle = () => {
    if (contentType === 'chat') {
      return 'Chat Permissions';
    }
    return contentType.charAt(0).toUpperCase() + contentType.slice(1) + ' Content';
  };

  // Format time for display (convert 24h to 12h format)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes}${ampm}`;
  };

  const filteredItems = selectedCategory === 'all' 
    ? contentItems 
    : contentItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-spinner"></div>
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
        onClick={goBack}
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
        zIndex: '1000',
        textAlign: 'center'
      }}>
        <div style={{margin: '0', fontSize: '1.6rem', color: '#ffffff', lineHeight: '1.2'}}>Manage</div>
        <div style={{margin: '0', fontSize: '1.4rem', color: '#ffffff', lineHeight: '1.2'}}>{getContentTypeTitle()}</div>
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
        <div className="admin-container" style={{
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

      {/* Category Filter - only show for non-chat content */}
      {contentType !== 'chat' && (
        <div className="admin-filters">
          <label>Filter by Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button 
            className="button-primary"
            onClick={() => setShowAddForm(true)}
            style={{ marginLeft: '1rem' }}
          >
            + Add New Content
          </button>
        </div>
      )}

      {/* Add/Edit Form - only show for non-chat content */}
      {showAddForm && contentType !== 'chat' && (
        <div className="admin-form-overlay">
          <div className="admin-form-modal">
            <h3>{editingItem ? 'Edit Content' : 'Add New Content'}</h3>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>

              <div className="admin-form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="admin-form-group">
                <label>Image</label>
                <ImageUpload 
                  currentImageUrl={formData.image_url}
                  onImageUploaded={(url) => setFormData({...formData, image_url: url})}
                />
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="admin-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Time fields for Schedule only */}
              {contentType === 'schedule' && (
                <>
                  <div className="admin-form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

              <div className="admin-form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div className="admin-form-buttons">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Add Content')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content List or User Permissions */}
      {contentType === 'chat' ? (
        <div className="admin-content-list">
          <h3 style={{ marginBottom: '1rem' }}>User Chat Permissions</h3>
          {users.length === 0 ? (
            <div className="admin-empty-state">
              <p>No users found.</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user.id} className="admin-content-item">
                <div className="admin-content-info">
                  <h4>{user.first_name} {user.last_name}</h4>
                  <p className="admin-content-desc">{user.email}</p>
                  <div className="admin-content-meta">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={user.team_inspire_enabled}
                          onChange={() => toggleUserPermission(user.id, 'team_inspire_enabled')}
                        />
                        Team Inspire Chat
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={user.can_create_chats}
                          onChange={() => toggleUserPermission(user.id, 'can_create_chats')}
                        />
                        Can Create Chats
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={user.can_send_messages}
                          onChange={() => toggleUserPermission(user.id, 'can_send_messages')}
                        />
                        Can Send Messages
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="admin-content-list">
          {filteredItems.length === 0 ? (
            <div className="admin-empty-state">
              <p>No content found for this category.</p>
              <button 
                className="button-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add First Item
              </button>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="admin-content-item">
                <div className="admin-content-thumbnail">
                  <img 
                    src={item.image_url || '/assets/logo.jpg'} 
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = '/assets/logo.jpg';
                    }}
                  />
                </div>
                <div className="admin-content-info">
                  <h4>{item.title}</h4>
                  <p className="admin-content-desc">{item.description}</p>
                  <div className="admin-content-meta">
                    <span className="admin-content-category">{item.category}</span>
                    <span className="admin-content-order">Order: {item.sort_order}</span>
                    {contentType === 'schedule' && item.start_time && item.end_time && (
                      <span className="admin-content-time">
                        {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      </span>
                    )}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="admin-content-link">
                        View Link
                      </a>
                    )}
                  </div>
                </div>
                <div className="admin-content-actions">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="admin-action-button edit"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(item)}
                    className="admin-action-button delete"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Admin2;