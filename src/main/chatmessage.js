import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MemberListModal from '../components/MemberListModal';
import ReportModal from '../components/ReportModal';
import {
  isUserAdmin,
  canUserSendInChat,
  hideMessageAsAdmin,
  unhideMessage,
  renameGroup,
  getChatSettings,
  updateChatSettings,
  getUserBlockedList
} from '../utils/chatHelpers';
import './chatmessage.css';

function ChatMessage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [participantUsers, setParticipantUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userPermissions, setUserPermissions] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [showMemberList, setShowMemberList] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [chatSettings, setChatSettings] = useState({});
  const [newGroupName, setNewGroupName] = useState('');
  const longPressTimer = useRef(null);
  const { chatId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && chatId) {
      loadUserPermissions();
      loadChatData();
      loadMessages();
      checkAdminStatus();
      checkSendPermission();
      loadBlockedUsers();
      loadChatSettings();
    }
  }, [user, chatId]);

  const checkAdminStatus = async () => {
    if (!user || !chatId) return;
    const adminStatus = await isUserAdmin(chatId, user.id);
    setIsAdmin(adminStatus);
  };

  const checkSendPermission = async () => {
    if (!user || !chatId) return;
    const permission = await canUserSendInChat(chatId, user.id);
    setCanSend(permission);
  };

  const loadBlockedUsers = async () => {
    if (!user) return;
    const blocked = await getUserBlockedList(user.id);
    setBlockedUsers(blocked);
  };

  const loadChatSettings = async () => {
    if (!chatId) return;
    const settings = await getChatSettings(chatId);
    setChatSettings(settings);
  };

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      navigate('/', { replace: true });
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const loadUserPermissions = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('can_send_messages, hidden_chats')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserPermissions(userData);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      setUserPermissions({
        can_send_messages: true,
        hidden_chats: []
      });
    }
  };

  const loadChatData = async () => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;
      setChat(chatData);

      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('user_id, joined_at')
        .eq('chat_id', chatId)
        .eq('is_active', true);

      if (participantError) throw participantError;

      await loadParticipantMetadata(participantData.map(p => p.user_id));
    } catch (error) {
      console.error('Error loading chat data:', error);
      alert('Error loading chat: ' + error.message);
      navigate('/chat');
    }
  };

  const loadParticipantMetadata = async (userIds) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (error) throw error;

      const usersMap = {};
      users.forEach(userRecord => {
        usersMap[userRecord.id] = {
          user_id: userRecord.id,
          first_name: userRecord.first_name || '',
          last_name: userRecord.last_name || '',
          full_name: userRecord.first_name && userRecord.last_name 
            ? `${userRecord.first_name} ${userRecord.last_name}`.trim()
            : userRecord.first_name || userRecord.last_name || 'Team Member',
          email: userRecord.email || ''
        };
      });

      setParticipantUsers(usersMap);
    } catch (error) {
      console.error('Error loading participant metadata:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: true });

      if (error) throw error;

      // Filter out messages from blocked users and admin-hidden messages
      const filteredMessages = (data || []).filter(msg => {
        // If message is hidden by admin and user is not admin, hide it
        if (msg.is_hidden_by_admin && !isAdmin) {
          return false;
        }
        // If sender is blocked, hide their messages
        if (blockedUsers.includes(msg.sender_id)) {
          return false;
        }
        return true;
      });

      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const getChatTitle = () => {
    if (!chat) return 'Chat';
    
    if (chat.type === 'individual') {
      const otherUserId = Object.keys(participantUsers).find(userId => userId !== user?.id);
      const otherParticipant = otherUserId ? participantUsers[otherUserId] : null;
      if (otherParticipant) {
        return otherParticipant.full_name || 'Team Member';
      }
      return 'Direct Message';
    }
    
    return chat.name;
  };

  const getChatSubtitle = () => {
    const participantCount = Object.keys(participantUsers).length;

    if (chat?.type === 'mandatory') {
      return `${participantCount} brothers • Main chat`;
    }
    if (chat?.type === 'group') {
      return `${participantCount} brothers`;
    }
    if (chat?.type === 'individual') {
      return 'Direct message';
    }
    return `${participantCount} brothers`;
  };

  const getUserDisplayName = (userId) => {
    if (userId === user?.id) return 'You';

    const participant = participantUsers[userId];
    if (participant && participant.full_name && participant.full_name !== 'Brother') {
      return participant.full_name;
    }

    return 'Brother';
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const isCurrentUser = (senderId) => senderId === user?.id;

  const canSendMessages = () => {
    return canSend && userPermissions.can_send_messages !== false;
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleMessageLongPress = (message, e) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      setSelectedMessage(message);
      setShowMessageActions(true);
    }, 500);
  };

  const handleMessagePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleHideMessage = async () => {
    if (!selectedMessage || !isAdmin) return;

    const result = await hideMessageAsAdmin(selectedMessage.id, user.id);

    if (result.success) {
      setShowMessageActions(false);
      setSelectedMessage(null);
      loadMessages(); // Reload to update UI
    } else {
      alert('Error hiding message: ' + result.error);
    }
  };

  const handleUnhideMessage = async () => {
    if (!selectedMessage || !isAdmin) return;

    const result = await unhideMessage(selectedMessage.id);

    if (result.success) {
      setShowMessageActions(false);
      setSelectedMessage(null);
      loadMessages(); // Reload to update UI
    } else {
      alert('Error unhiding message: ' + result.error);
    }
  };

  const handleReportMessage = () => {
    if (!selectedMessage) return;

    setReportType('message');
    setReportData({
      messageId: selectedMessage.id,
      messageText: selectedMessage.message
    });
    setShowMessageActions(false);
    setShowReportModal(true);
  };

  const handleReportUserFromMember = (member) => {
    setReportType('user');
    setReportData({
      userId: member.userId,
      userName: member.fullName
    });
    setShowReportModal(true);
  };

  const handleStartDMFromMember = async (member) => {
    // Check if individual chat already exists
    try {
      const { data: existingChats, error } = await supabase
        .from('chats')
        .select(`
          id,
          chat_participants!inner(user_id)
        `)
        .eq('type', 'individual')
        .eq('chat_participants.user_id', user.id)
        .eq('chat_participants.is_active', true);

      if (error) throw error;

      // Check each chat for the other participant
      for (const chat of existingChats || []) {
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id)
          .eq('is_active', true);

        if (participants?.length === 2) {
          const hasOtherUser = participants.some(p => p.user_id === member.userId);
          if (hasOtherUser) {
            // Navigate to existing chat
            navigate(`/chat/${chat.id}`);
            return;
          }
        }
      }

      // No existing chat, navigate to create
      navigate('/chat/create', { state: { preselectedUser: member } });
    } catch (error) {
      console.error('Error checking for existing chat:', error);
      navigate('/chat/create');
    }
  };

  const handleRenameGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    const result = await renameGroup(chatId, newGroupName.trim());

    if (result.success) {
      setChat(prev => ({ ...prev, name: newGroupName.trim() }));
      setNewGroupName('');
      alert('Group renamed successfully');
    } else {
      alert('Error renaming group: ' + result.error);
    }
  };

  const handleToggleInvitePermission = async () => {
    const newValue = !chatSettings.allow_member_invites;

    const result = await updateChatSettings(chatId, {
      allow_member_invites: newValue
    });

    if (result.success) {
      setChatSettings(prev => ({ ...prev, allow_member_invites: newValue }));
    } else {
      alert('Error updating settings: ' + result.error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!canSendMessages()) {
      alert('You do not have permission to send messages.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: user.id,
            message: newMessage.trim()
          }
        ]);

      if (error) throw error;

      setNewMessage('');
      
      // Reset textarea height after sending
      setTimeout(() => {
        const textarea = document.querySelector('.message-input');
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = '40px';
        }
      }, 10);

      // Reload messages to show the new message
      await loadMessages();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (loading) {
    return (
      <div className="chat-message-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ color: '#888' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-message-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <h3 style={{ color: '#fff' }}>Chat not found</h3>
          <button onClick={handleBackToChat} style={{ background: '#ff0000', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', marginTop: '16px' }}>
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message-container">
      {/* Header */}
      <div className="chat-header">
        <button className="back-button-chat" onClick={handleBackToChat}>
          <span style={{ fontSize: '1.2rem' }}>←</span>
          <span>BACK</span>
        </button>
        <div className="chat-info">
          <h1 className="chat-title">{getChatTitle()}</h1>
          <p className="chat-subtitle">{getChatSubtitle()}</p>
        </div>
        {chat?.type !== 'individual' && (
          <button
            className="chat-menu-button"
            onClick={() => setShowMemberList(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Messages container - middle area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <h3>No messages yet</h3>
            <p>Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${isCurrentUser(msg.sender_id) ? 'current-user' : 'other-user'} ${msg.is_hidden_by_admin ? 'admin-hidden' : ''}`}
                onTouchStart={(e) => handleMessageLongPress(msg, e)}
                onTouchEnd={handleMessagePressEnd}
                onMouseDown={(e) => handleMessageLongPress(msg, e)}
                onMouseUp={handleMessagePressEnd}
                onMouseLeave={handleMessagePressEnd}
              >
                {!isCurrentUser(msg.sender_id) && (
                  <div className="message-sender">
                    <span className="sender-name">
                      {getUserDisplayName(msg.sender_id)}
                    </span>
                    <span className="message-time">{formatMessageTime(msg.sent_at)}</span>
                  </div>
                )}

                <div className={`message-content ${isCurrentUser(msg.sender_id) ? 'current-user' : 'other-user'}`}>
                  {msg.message}
                  {msg.is_hidden_by_admin && isAdmin && (
                    <span className="admin-hidden-tag">[Hidden by admin]</span>
                  )}
                </div>

                {isCurrentUser(msg.sender_id) && (
                  <div className="message-time-current">
                    {formatMessageTime(msg.sent_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input - Static at bottom */}
      <div className="message-input-container">
        {canSendMessages() ? (
          <div className="message-input-wrapper">
            <textarea
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${getChatTitle()}...`}
              className="message-input"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`send-button ${newMessage.trim() ? 'active' : ''}`}
            >
              →
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px', fontWeight: '600' }}>
            You have been restricted from sending messages in this group.
          </div>
        )}
      </div>

      {/* Member List Modal */}
      {showMemberList && (
        <MemberListModal
          chatId={chatId}
          currentUserId={user?.id}
          chatType={chat?.type}
          onClose={() => setShowMemberList(false)}
          onStartDM={handleStartDMFromMember}
          onReportUser={handleReportUserFromMember}
        />
      )}

      {/* Report Modal */}
      {showReportModal && reportData && (
        <ReportModal
          type={reportType}
          data={reportData}
          currentUserId={user?.id}
          chatId={chatId}
          onClose={() => {
            setShowReportModal(false);
            setReportData(null);
            setReportType(null);
          }}
        />
      )}

      {/* Message Actions Modal */}
      {showMessageActions && selectedMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => {
            setShowMessageActions(false);
            setSelectedMessage(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '20px',
              minWidth: '280px',
              maxWidth: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '16px' }}>Message Options</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleReportMessage}
                style={{
                  padding: '14px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                Report Message
              </button>

              {isAdmin && (
                <button
                  onClick={selectedMessage.is_hidden_by_admin ? handleUnhideMessage : handleHideMessage}
                  style={{
                    padding: '14px',
                    backgroundColor: selectedMessage.is_hidden_by_admin ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  {selectedMessage.is_hidden_by_admin ? 'Unhide Message' : 'Hide from Everyone'}
                </button>
              )}

              <button
                onClick={() => {
                  setShowMessageActions(false);
                  setSelectedMessage(null);
                }}
                style={{
                  padding: '14px',
                  backgroundColor: '#2d2d2d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;