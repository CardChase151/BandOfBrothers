import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  isUserAdmin,
  toggleMemberSendPermission,
  removeMemberFromChat,
  assignChatAdmin,
  removeAdmin,
  blockUser,
  unblockUser
} from '../utils/chatHelpers';
import './MemberListModal.css';

function MemberListModal({ chatId, currentUserId, chatType, onClose, onStartDM, onReportUser }) {
  const [members, setMembers] = useState([]);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberActions, setShowMemberActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    loadMembers();
    checkIfAdmin();
    loadBlockedUsers();
  }, [chatId, currentUserId]);

  const loadBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('blocked_users')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;
      setBlockedUsers(data?.blocked_users || []);
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const checkIfAdmin = async () => {
    const isAdmin = await isUserAdmin(chatId, currentUserId);
    setIsCurrentUserAdmin(isAdmin);
  };

  const loadMembers = async () => {
    try {
      setLoading(true);

      // Get chat participants
      const { data: participants, error: participantsError } = await supabase
        .from('chat_participants')
        .select('user_id, can_send, joined_at')
        .eq('chat_id', chatId)
        .eq('is_active', true);

      if (participantsError) throw participantsError;

      // Get user details
      const userIds = participants.map(p => p.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Get admins
      const { data: adminData, error: adminError } = await supabase
        .from('chat_admins')
        .select('user_id')
        .eq('chat_id', chatId);

      // Combine data
      const membersWithData = participants.map(p => {
        const user = users.find(u => u.id === p.user_id);
        return {
          userId: p.user_id,
          firstName: user?.first_name || '',
          lastName: user?.last_name || '',
          fullName: user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`.trim()
            : user?.first_name || user?.last_name || 'Team Member',
          email: user?.email || '',
          canSend: p.can_send,
          joinedAt: p.joined_at,
          isAdmin: adminData?.some(a => a.user_id === p.user_id) || false
        };
      });

      // Sort: current user first, then admins, then alphabetically
      membersWithData.sort((a, b) => {
        if (a.userId === currentUserId) return -1;
        if (b.userId === currentUserId) return 1;
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return a.fullName.localeCompare(b.fullName);
      });

      setMembers(membersWithData);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (member) => {
    if (member.userId === currentUserId) return; // Can't act on yourself
    setSelectedMember(member);
    setShowMemberActions(true);
  };

  const handleStartDM = () => {
    if (selectedMember) {
      onStartDM(selectedMember);
      onClose();
    }
  };

  const handleMuteMember = async () => {
    if (!selectedMember) return;

    const newCanSend = !selectedMember.canSend;
    const result = await toggleMemberSendPermission(chatId, selectedMember.userId, newCanSend);

    if (result.success) {
      setShowMemberActions(false);
      loadMembers(); // Reload to show updated status
    } else {
      alert('Error updating permissions: ' + result.error);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Remove ${selectedMember.fullName} from this chat?`)) return;

    const result = await removeMemberFromChat(chatId, selectedMember.userId);

    if (result.success) {
      setShowMemberActions(false);
      loadMembers(); // Reload
    } else {
      alert('Error removing member: ' + result.error);
    }
  };

  const handleToggleAdmin = async () => {
    if (!selectedMember) return;

    if (selectedMember.isAdmin) {
      // Remove admin
      const result = await removeAdmin(chatId, selectedMember.userId);
      if (result.success) {
        setShowMemberActions(false);
        loadMembers();
      } else {
        alert('Error removing admin: ' + result.error);
      }
    } else {
      // Make admin
      const result = await assignChatAdmin(chatId, selectedMember.userId, currentUserId);
      if (result.success) {
        setShowMemberActions(false);
        loadMembers();
      } else {
        alert('Error assigning admin: ' + result.error);
      }
    }
  };

  const handleBlockUser = async () => {
    if (!selectedMember) return;

    const isBlocked = blockedUsers.includes(selectedMember.userId);

    if (isBlocked) {
      // Unblock
      const result = await unblockUser(currentUserId, selectedMember.userId);
      if (result.success) {
        setBlockedUsers(prev => prev.filter(id => id !== selectedMember.userId));
        setShowMemberActions(false);
      } else {
        alert('Error unblocking user: ' + result.error);
      }
    } else {
      // Block
      // eslint-disable-next-line no-restricted-globals
      if (!confirm(`Block ${selectedMember.fullName}? You won't see their messages.`)) return;

      const result = await blockUser(currentUserId, selectedMember.userId);
      if (result.success) {
        setBlockedUsers(prev => [...prev, selectedMember.userId]);
        setShowMemberActions(false);
      } else {
        alert('Error blocking user: ' + result.error);
      }
    }
  };

  const handleReportUser = () => {
    if (selectedMember) {
      onReportUser(selectedMember);
      setShowMemberActions(false);
    }
  };

  const getMemberInitials = (member) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
    }
    return member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const closeMemberActions = () => {
    setShowMemberActions(false);
    setSelectedMember(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content member-list-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Members ({members.length})</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Member List */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading members...</p>
            </div>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className={`member-card ${member.userId === currentUserId ? 'current-user' : ''}`}
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="member-avatar">
                    {getMemberInitials(member)}
                  </div>

                  <div className="member-info">
                    <div className="member-name">
                      {member.fullName}
                      {member.userId === currentUserId && <span className="you-badge">(You)</span>}
                    </div>
                    <div className="member-status">
                      {member.isAdmin && <span className="admin-badge">Admin</span>}
                      {!member.canSend && <span className="muted-badge">Muted</span>}
                      {blockedUsers.includes(member.userId) && <span className="blocked-badge">Blocked</span>}
                    </div>
                  </div>

                  {member.userId !== currentUserId && (
                    <div className="member-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Action Modal */}
        {showMemberActions && selectedMember && (
          <div className="action-modal-overlay" onClick={closeMemberActions}>
            <div className="action-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedMember.fullName}</h3>

              <div className="action-buttons">
                {/* Everyone can do these */}
                <button className="action-btn primary" onClick={handleStartDM}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                  Send Message
                </button>

                <button className="action-btn secondary" onClick={handleReportUser}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Report User
                </button>

                <button
                  className={`action-btn ${blockedUsers.includes(selectedMember.userId) ? 'success' : 'warning'}`}
                  onClick={handleBlockUser}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                  </svg>
                  {blockedUsers.includes(selectedMember.userId) ? 'Unblock User' : 'Block User'}
                </button>

                {/* Admin-only actions */}
                {isCurrentUserAdmin && (
                  <>
                    <button
                      className={`action-btn ${selectedMember.canSend ? 'warning' : 'success'}`}
                      onClick={handleMuteMember}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        {selectedMember.canSend ? (
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        ) : (
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        )}
                      </svg>
                      {selectedMember.canSend ? 'Mute Member' : 'Unmute Member'}
                    </button>

                    <button className="action-btn warning" onClick={handleToggleAdmin}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                      {selectedMember.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>

                    <button className="action-btn danger" onClick={handleRemoveMember}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13H5v-2h14v2z"/>
                      </svg>
                      Remove from Chat
                    </button>
                  </>
                )}

                <button className="action-btn cancel" onClick={closeMemberActions}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberListModal;
