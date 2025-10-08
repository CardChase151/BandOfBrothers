import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './comments.css';

const Comments = ({ prayer, onClose, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
    fetchComments();

    // Subscribe to real-time comments
    const subscription = supabase
      .channel(`prayer_comments:${prayer.id}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_comments',
          filter: `prayer_id=eq.${prayer.id}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [prayer.id]);

  const fetchUserProfile = async () => {
    if (!currentUser?.id) return;

    // Use currentUser directly if it already has the profile data
    if (currentUser.first_name || currentUser.last_name || currentUser.name) {
      setUserProfile(currentUser);
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('first_name, last_name, name')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('prayer_comments')
      .select('*')
      .eq('prayer_id', prayer.id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(data || []);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser?.id) return;

    const authorName = userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.name || 'Anonymous';

    const { error } = await supabase
      .from('prayer_comments')
      .insert({
        prayer_id: prayer.id,
        user_id: currentUser.id,
        parent_comment_id: null,
        author_name: authorName,
        is_anonymous: isAnonymous,
        comment_text: commentText.trim()
      });

    if (error) {
      console.error('Error posting comment:', error);
      return;
    }

    setCommentText('');
    setIsAnonymous(false);

    // Immediately fetch comments to show the new one
    await fetchComments();
  };

  const handleDelete = async (commentId) => {
    const { error } = await supabase
      .from('prayer_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error deleting comment:', error);
      return;
    }

    // Immediately fetch comments to reflect deletion
    await fetchComments();
  };


  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  const renderComment = (comment) => {
    const isOwn = comment.user_id === currentUser?.id;
    const displayName = comment.is_anonymous ? 'Brother in Christ' : comment.author_name;
    const avatarLetter = comment.is_anonymous ? 'B' : (comment.author_name?.charAt(0) || '?');

    return (
      <div key={comment.id} className="comment-item">
        <div className="comment-avatar">
          <span className="comment-avatar-letter">{avatarLetter}</span>
        </div>
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">{displayName}</span>
            <span className="comment-time">{getTimeAgo(comment.created_at)}</span>
          </div>
          <p className="comment-text">{comment.comment_text}</p>
          {isOwn && (
            <div className="comment-actions">
              <button className="comment-delete-btn" onClick={() => handleDelete(comment.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="comments-overlay" onClick={onClose}>
      <div className="comments-panel" onClick={(e) => e.stopPropagation()}>
        {/* Prayer Header */}
        <div className="comments-prayer-header">
          <button className="comments-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="comments-prayer-info">
            <div className="comments-prayer-avatar">
              <span className="avatar-letter">
                {prayer.is_anonymous ? 'B' : (prayer.author_name?.charAt(0) || '?')}
              </span>
            </div>
            <div className="comments-prayer-details">
              <div className="comments-prayer-author">
                {prayer.is_anonymous ? 'Brother in Christ' : prayer.author_name}
              </div>
              <div className="comments-prayer-category">{prayer.category}</div>
            </div>
          </div>
          {prayer.request_text && (
            <p className="comments-prayer-text">{prayer.request_text}</p>
          )}
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              <p>No comments yet. Be the first to encourage your brother.</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>

        {/* Comment Input */}
        <div className="comments-input-container">
          <form onSubmit={handleSubmit} className="comments-input-form">
            <div className="comments-anonymous-toggle">
              <label className="anonymous-checkbox">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span className="anonymous-label">Post anonymously</span>
              </label>
            </div>
            <div className="comments-input-row">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Encourage your brother..."
                className="comment-textarea"
                rows="1"
              />
              <button
                type="submit"
                className="comment-send-btn"
                disabled={!commentText.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Comments;
