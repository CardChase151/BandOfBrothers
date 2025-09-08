import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './chatmessage.css';

function ChatMessage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [participantUsers, setParticipantUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const { chatId } = useParams();
  const navigate = useNavigate();

  // ========== INITIALIZATION ==========
  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  useEffect(() => {
    if (user && chatId) {
      loadUserPermissions();
      loadChatData();
      loadMessages();
    }
  }, [user, chatId]);

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

  // ========== DATA LOADING ==========
  const loadChatData = async () => {
    setIsLoadingChat(true);
    try {
      // Load chat info
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) throw chatError;
      setChat(chatData);

      // Load chat participants
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('user_id, joined_at')
        .eq('chat_id', chatId)
        .eq('is_active', true);

      if (participantError) throw participantError;

      // Get user metadata for all participants
      await loadParticipantMetadata(participantData.map(p => p.user_id));

    } catch (error) {
      console.error('Error loading chat data:', error);
      alert('Error loading chat: ' + error.message);
      navigate('/chat');
    } finally {
      setIsLoadingChat(false);
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
      
      // Fallback to basic user objects
      const fallbackUsers = {};
      userIds.forEach(userId => {
        fallbackUsers[userId] = {
          user_id: userId,
          first_name: 'Team',
          last_name: 'Member',
          full_name: `Team Member ${userId.slice(-4)}`,
          email: ''
        };
      });
      setParticipantUsers(fallbackUsers);
    }
  };

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // ========== CHAT TYPE HELPERS ==========
  const isMandatoryChat = () => chat?.type === 'mandatory';
  const isGroupChat = () => chat?.type === 'group';
  const isIndividualChat = () => chat?.type === 'individual';

  const getChatTitle = () => {
    if (!chat) return 'Chat';
    
    // For individual chats, show only the other person's name
    if (isIndividualChat()) {
      const otherParticipant = getOtherParticipant();
      if (otherParticipant) {
        return otherParticipant.full_name || 'Team Member';
      }
      return 'Direct Message';
    }
    
    // For mandatory and group chats, use the stored name
    return chat.name;
  };

  const getChatSubtitle = () => {
    const participantCount = Object.keys(participantUsers).length;
    
    if (isMandatoryChat()) {
      return `${participantCount} members • Required`;
    }
    if (isGroupChat()) {
      return `${participantCount} members`;
    }
    if (isIndividualChat()) {
      return 'Direct message';
    }
    return `${participantCount} members`;
  };

  const getHeaderStyle = () => {
    if (isMandatoryChat()) {
      return 'mandatory';
    }
    return 'default';
  };

  // ========== PARTICIPANT HELPERS ==========
  const getOtherParticipant = () => {
    const otherUserId = Object.keys(participantUsers).find(userId => userId !== user?.id);
    return otherUserId ? participantUsers[otherUserId] : null;
  };

  const getUserDisplayName = (userId) => {
    if (userId === user?.id) return 'You';
    
    const participant = participantUsers[userId];
    if (participant && participant.full_name && participant.full_name !== 'Team Member') {
      return participant.full_name;
    }
    
    return 'Team Member';
  };

  // ========== PERMISSIONS ==========
  const canSendMessages = () => {
    return userPermissions.can_send_messages !== false;
  };

  const canManageGroup = () => {
    return chat?.created_by === user?.id;
  };

  // ========== MENU OPTIONS ==========
  const getMandatoryMenuOptions = () => [
    { id: 'mute', label: 'Mute Chat', icon: 'mute' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'members', label: 'View Members', icon: 'users' },
    { id: 'info', label: 'Chat Info', icon: 'info' }
  ];

  const getGroupMenuOptions = () => [
    { id: 'mute', label: 'Mute Chat', icon: 'mute' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'members', label: 'View Members', icon: 'users' },
    ...(canManageGroup() ? [
      { id: 'add', label: 'Add Members', icon: 'plus' },
      { id: 'manage', label: 'Manage Group', icon: 'settings' }
    ] : []),
    { id: 'leave', label: 'Leave Group', icon: 'exit' }
  ];

  const getIndividualMenuOptions = () => [
    { id: 'mute', label: 'Mute Chat', icon: 'mute' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'archive', label: 'Archive Chat', icon: 'archive' }
  ];

  const getMenuOptions = () => {
    if (isMandatoryChat()) return getMandatoryMenuOptions();
    if (isGroupChat()) return getGroupMenuOptions();
    if (isIndividualChat()) return getIndividualMenuOptions();
    return [];
  };

  // ========== MESSAGE HELPERS ==========
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Same day - show time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      // Different day - show date and time
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

  // ========== EVENT HANDLERS ==========
  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleMenuOption = async (option) => {
    console.log('Menu option:', option);
    setShowMenu(false);
    
    switch (option) {
      case 'mute':
        alert('Mute functionality coming soon!');
        break;
      case 'search':
        alert('Search functionality coming soon!');
        break;
      case 'members':
        const membersList = Object.values(participantUsers)
          .map(p => p.full_name)
          .join(', ');
        alert(`Members: ${membersList}`);
        break;
      case 'add':
        alert('Add members functionality coming soon!');
        break;
      case 'leave':
        if (window.confirm('Are you sure you want to leave this group?')) {
          await handleLeaveGroup();
        }
        break;
      case 'archive':
        if (window.confirm('Are you sure you want to archive this chat?')) {
          await handleArchiveChat();
        }
        break;
      case 'manage':
        alert('Group management coming soon!');
        break;
      case 'info':
        alert('Chat info coming soon!');
        break;
      default:
        console.log('Unknown menu option:', option);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const hiddenChats = userPermissions.hidden_chats || [];
      if (!hiddenChats.includes(chatId)) {
        hiddenChats.push(chatId);
        
        const { error } = await supabase
          .from('users')
          .update({ hidden_chats: hiddenChats })
          .eq('id', user.id);

        if (error) throw error;
        
        alert('You have left the group. It has been moved to your archived chats.');
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Error leaving group: ' + error.message);
    }
  };

  const handleArchiveChat = async () => {
    try {
      const hiddenChats = userPermissions.hidden_chats || [];
      if (!hiddenChats.includes(chatId)) {
        hiddenChats.push(chatId);
        
        const { error } = await supabase
          .from('users')
          .update({ hidden_chats: hiddenChats })
          .eq('id', user.id);

        if (error) throw error;
        
        alert('Chat has been archived.');
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
      alert('Error archiving chat: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Check permissions
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

      // Clear input and reload messages
      setNewMessage('');
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

  // ========== MENU ICON RENDERING ==========
  const renderMenuIcon = (iconType) => {
    const icons = {
      mute: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2-2-2 M21 12H9" />,
      search: <><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35"/></>,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />,
      plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
      exit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
      archive: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />,
      info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    };
    
    return (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[iconType] || icons.info}
      </svg>
    );
  };

  // ========== LOADING STATES ==========
  if (loading || isLoadingChat) {
    return (
      <div className="app-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="app-container">
        <div className="error-state">
          <h3>Chat not found</h3>
          <button onClick={handleBackToChat} className="button-primary">
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="chat-message-container">
      {/* Header */}
      <div className={`chat-header ${getHeaderStyle()}`}>
        {/* Back Button */}
        <button className="back-button-chat" onClick={handleBackToChat}>
          ←
        </button>

        {/* Chat Info */}
        <div className="chat-info">
          <h2 className={`chat-title ${getHeaderStyle()}`}>
            {getChatTitle()}
          </h2>
          <p className="chat-subtitle">
            {getChatSubtitle()}
          </p>
        </div>

        {/* Menu Button */}
        <div className="menu-container">
          <button 
            className="menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="menu-dot"></div>
            <div className="menu-dot"></div>
            <div className="menu-dot"></div>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="dropdown-menu">
              {getMenuOptions().map((option) => (
                <button
                  key={option.id}
                  className="menu-option"
                  onClick={() => handleMenuOption(option.id)}
                >
                  {renderMenuIcon(option.icon)}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="messages-container"
        onClick={() => setShowMenu(false)}
      >
        {isLoadingMessages ? (
          <div className="loading-messages">
            <div className="loader"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="#666" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3>No messages yet</h3>
            <p>
              {isMandatoryChat() && 'Be the first to welcome everyone to the team!'}
              {isGroupChat() && 'Start the conversation with your group members.'}
              {isIndividualChat() && 'Send the first message to get started.'}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble ${isCurrentUser(msg.sender_id) ? 'current-user' : 'other-user'}`}>
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

      {/* Message Input */}
      <div className="message-input-container">
        {canSendMessages() ? (
          <div className="message-input-wrapper">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isMandatoryChat() ? 'Message Team Inspire...' :
                isGroupChat() ? `Message ${chat.name}...` :
                `Message ${getChatTitle()}...`
              }
              className="message-input"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`send-button ${newMessage.trim() ? 'active' : 'disabled'}`}
            >
              →
            </button>
          </div>
        ) : (
          <div className="message-input-disabled">
            <p>You do not have permission to send messages in this chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;