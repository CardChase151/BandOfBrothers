import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './chatcreate.css';

function ChatCreate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
      loadTeamMembers();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, allUsers]);

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
        .select('can_create_chats')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (!userData.can_create_chats) {
        alert('You do not have permission to create chats.');
        navigate('/chat');
        return;
      }
      
      setUserPermissions(userData);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      navigate('/chat');
    }
  };

  const loadTeamMembers = async () => {
    setIsLoadingUsers(true);
    try {
      // Get all users except current user from users table
      const { data: users, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .neq('id', user.id);

      if (error) throw error;

      // Format users for display
      const teamMembers = users.map(userRecord => {
        const firstName = userRecord.first_name || '';
        const lastName = userRecord.last_name || '';
        const fullName = firstName && lastName 
          ? `${firstName} ${lastName}`.trim()
          : firstName || lastName || 'Team Member';

        return {
          user_id: userRecord.id,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          email: userRecord.email || ''
        };
      }).filter(user => user.first_name); // Only show users with actual names

      setAllUsers(teamMembers);
      setFilteredUsers(teamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filterUsers = () => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(u => 
        u.full_name?.toLowerCase().includes(query) ||
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleUserToggle = (selectedUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.user_id === selectedUser.user_id);
      if (isSelected) {
        return prev.filter(u => u.user_id !== selectedUser.user_id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some(u => u.user_id === userId);
  };

  const getChatTypeText = () => {
    if (selectedUsers.length === 0) return 'Select team members';
    if (selectedUsers.length === 1) return 'Individual chat';
    return `Group chat (${selectedUsers.length} members)`;
  };

  const getSelectedNamesText = () => {
    if (selectedUsers.length === 0) return '';
    if (selectedUsers.length === 1) return selectedUsers[0].full_name;
    if (selectedUsers.length === 2) {
      return `${selectedUsers[0].full_name} and ${selectedUsers[1].full_name}`;
    }
    return `${selectedUsers[0].full_name} and ${selectedUsers.length - 1} others`;
  };

  const generateChatName = () => {
    if (selectedUsers.length === 1) {
      // Individual chat: Only use the other person's name
      return selectedUsers[0].full_name;
    } else {
      // Group chat: Use custom name if provided
      if (groupName.trim()) {
        return groupName.trim();
      }
      
      // Auto-generate group name from first names
      if (selectedUsers.length <= 3) {
        const firstNames = selectedUsers.map(u => u.first_name || u.full_name.split(' ')[0]);
        return `${firstNames.join(', ')} Group`;
      } else {
        const firstName = selectedUsers[0].first_name || selectedUsers[0].full_name.split(' ')[0];
        return `${firstName} + ${selectedUsers.length - 1} others`;
      }
    }
  };

  const checkForExistingIndividualChat = async (otherUserId) => {
    try {
      // Get all individual chats where current user is a participant
      const { data: userChats, error } = await supabase
        .from('chats')
        .select(`
          id,
          chat_participants!inner(user_id)
        `)
        .eq('type', 'individual')
        .eq('chat_participants.user_id', user.id)
        .eq('chat_participants.is_active', true);

      if (error) throw error;

      // Check each chat for exactly 2 participants including the other user
      for (const chat of userChats || []) {
        const { data: allParticipants, error: participantError } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id)
          .eq('is_active', true);

        if (participantError) continue;

        if (allParticipants.length === 2) {
          const participantIds = allParticipants.map(p => p.user_id);
          if (participantIds.includes(user.id) && participantIds.includes(otherUserId)) {
            return chat.id;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking for existing chat:', error);
      return null;
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one team member');
      return;
    }

    if (!firstMessage.trim()) {
      alert('Please write a first message');
      return;
    }

    // For group chats, require a group name
    if (selectedUsers.length > 1 && !groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setIsCreating(true);

    try {
      let chatId = null;

      // For individual chats, check if one already exists
      if (selectedUsers.length === 1) {
        const existingChatId = await checkForExistingIndividualChat(selectedUsers[0].user_id);
        
        if (existingChatId) {
          // Send message to existing chat and navigate
          const { error: messageError } = await supabase
            .from('chat_messages')
            .insert([{
              chat_id: existingChatId,
              sender_id: user.id,
              message: firstMessage.trim()
            }]);

          if (messageError) throw messageError;
          navigate(`/chat/${existingChatId}`);
          return;
        }
      }

      // Create new chat
      const chatData = {
        name: generateChatName(),
        type: selectedUsers.length === 1 ? 'individual' : 'group',
        created_by: user.id,
        is_active: true
      };

      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([chatData])
        .select()
        .single();

      if (chatError) throw chatError;
      chatId = newChat.id;

      // Add all participants
      const participants = [
        // Add current user
        {
          chat_id: chatId,
          user_id: user.id,
          is_active: true
        },
        // Add selected users
        ...selectedUsers.map(u => ({
          chat_id: chatId,
          user_id: u.user_id,
          is_active: true
        }))
      ];

      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantError) throw participantError;

      // Send first message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          message: firstMessage.trim()
        }]);

      if (messageError) throw messageError;

      // Navigate to new chat
      navigate(`/chat/${chatId}`);

    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error creating chat: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setGroupName('');
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-create-container">
      {/* Header */}
      <div className="chat-create-header">
        <button className="back-button-create" onClick={handleBackToChat}>
          ←
        </button>
        <div className="header-content">
          <h1 className="create-title">New Chat</h1>
          <p className="create-subtitle">{getChatTypeText()}</p>
        </div>
      </div>

      {/* Selected Users Preview */}
      {selectedUsers.length > 0 && (
        <div className="selected-preview">
          <div className="selected-info">
            <div className="selected-count">
              {selectedUsers.length} selected
            </div>
            <div className="selected-names">
              {getSelectedNamesText()}
            </div>
          </div>
          <button className="clear-selection" onClick={clearSelection}>
            Clear
          </button>
        </div>
      )}

      {/* Group Name Input - Only show for groups */}
      {selectedUsers.length > 1 && (
        <div className="group-name-section">
          <div className="group-name-container">
            <label htmlFor="groupName" className="group-name-label">
              Group Name <span className="required">*</span>
            </label>
            <input
              id="groupName"
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="group-name-input"
              maxLength={50}
              disabled={isCreating}
            />
            <div className="group-name-hint">
              {groupName.length}/50 characters
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="users-container">
        {isLoadingUsers ? (
          <div className="loading-users">
            <div className="loader"></div>
            <p>Loading team members...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-users">
            <svg width="64" height="64" fill="none" stroke="#666" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3>No team members found</h3>
            <p>{searchQuery ? 'Try adjusting your search.' : 'No team members available.'}</p>
          </div>
        ) : (
          <div className="users-list">
            {filteredUsers.map((teamUser) => (
              <div
                key={teamUser.user_id}
                className={`user-card ${isUserSelected(teamUser.user_id) ? 'selected' : ''}`}
                onClick={() => handleUserToggle(teamUser)}
              >
                <div className="user-avatar">
                  {teamUser.full_name ? 
                    teamUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase() 
                    : 'TM'
                  }
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {teamUser.full_name}
                  </div>
                  <div className="user-email">
                    {teamUser.email || 'Team member'}
                  </div>
                </div>
                <div className="selection-indicator">
                  {isUserSelected(teamUser.user_id) && (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* First Message Input */}
      {selectedUsers.length > 0 && (
        <div className="message-section">
          <div className="message-header">
            <h3>Send your first message</h3>
            <p>to {getSelectedNamesText()}</p>
          </div>
          
          <div className="message-input-container">
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Hey ${getSelectedNamesText()}, `}
              className="first-message-input"
              rows="3"
              disabled={isCreating}
            />
            
            <button
              onClick={handleCreateChat}
              disabled={
                !firstMessage.trim() || 
                isCreating || 
                (selectedUsers.length > 1 && !groupName.trim())
              }
              className={`create-chat-button ${
                firstMessage.trim() && 
                !isCreating && 
                (selectedUsers.length === 1 || groupName.trim())
                  ? 'active' : 'disabled'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="button-loader"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                  Send & Create Chat
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatCreate;