import { supabase } from '../supabaseClient';

// ============================================
// ADMIN CHECKS
// ============================================

export const isUserAdmin = async (chatId, userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_admins')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getChatAdmins = async (chatId) => {
  try {
    const { data, error } = await supabase
      .from('chat_admins')
      .select('user_id, assigned_at, assigned_by')
      .eq('chat_id', chatId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting chat admins:', error);
    return [];
  }
};

export const assignChatAdmin = async (chatId, newAdminId, assignedBy) => {
  try {
    const { data, error } = await supabase
      .from('chat_admins')
      .insert([
        {
          chat_id: chatId,
          user_id: newAdminId,
          assigned_by: assignedBy
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error assigning admin:', error);
    return { success: false, error: error.message };
  }
};

export const removeAdmin = async (chatId, adminId) => {
  try {
    const { error } = await supabase
      .from('chat_admins')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', adminId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing admin:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// PERMISSION CHECKS
// ============================================

export const canUserSendInChat = async (chatId, userId) => {
  try {
    // Check global permission
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('can_send_messages')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (userData.can_send_messages === false) return false;

    // Check chat-specific permission
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('can_send')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (participantError) return true; // Default to true if not found
    return participantData.can_send !== false;
  } catch (error) {
    console.error('Error checking send permission:', error);
    return true; // Default to true on error
  }
};

export const toggleMemberSendPermission = async (chatId, userId, canSend) => {
  try {
    const { error } = await supabase
      .from('chat_participants')
      .update({ can_send: canSend })
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error toggling send permission:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BLOCKING
// ============================================

export const getUserBlockedList = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('blocked_users')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.blocked_users || [];
  } catch (error) {
    console.error('Error getting blocked list:', error);
    return [];
  }
};

export const blockUser = async (currentUserId, userIdToBlock) => {
  try {
    const blockedList = await getUserBlockedList(currentUserId);

    if (blockedList.includes(userIdToBlock)) {
      return { success: true, message: 'User already blocked' };
    }

    const updatedList = [...blockedList, userIdToBlock];

    const { error } = await supabase
      .from('users')
      .update({ blocked_users: updatedList })
      .eq('id', currentUserId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error: error.message };
  }
};

export const unblockUser = async (currentUserId, userIdToUnblock) => {
  try {
    const blockedList = await getUserBlockedList(currentUserId);
    const updatedList = blockedList.filter(id => id !== userIdToUnblock);

    const { error } = await supabase
      .from('users')
      .update({ blocked_users: updatedList })
      .eq('id', currentUserId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { success: false, error: error.message };
  }
};

export const isUserBlocked = async (currentUserId, otherUserId) => {
  const blockedList = await getUserBlockedList(currentUserId);
  return blockedList.includes(otherUserId);
};

// ============================================
// HIDE CHAT
// ============================================

export const hideChat = async (userId, chatId) => {
  try {
    // Get current hidden chats
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('hidden_chats, chat_hide_timestamps')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const hiddenChats = userData?.hidden_chats || [];
    const hideTimestamps = userData?.chat_hide_timestamps || {};

    if (hiddenChats.includes(chatId)) {
      return { success: true, message: 'Chat already hidden' };
    }

    const updatedHiddenChats = [...hiddenChats, chatId];
    const updatedTimestamps = {
      ...hideTimestamps,
      [chatId]: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users')
      .update({
        hidden_chats: updatedHiddenChats,
        chat_hide_timestamps: updatedTimestamps
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error hiding chat:', error);
    return { success: false, error: error.message };
  }
};

export const unhideChat = async (userId, chatId) => {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('hidden_chats, chat_hide_timestamps')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const hiddenChats = userData?.hidden_chats || [];
    const hideTimestamps = userData?.chat_hide_timestamps || {};

    const updatedHiddenChats = hiddenChats.filter(id => id !== chatId);
    const updatedTimestamps = { ...hideTimestamps };
    delete updatedTimestamps[chatId];

    const { error } = await supabase
      .from('users')
      .update({
        hidden_chats: updatedHiddenChats,
        chat_hide_timestamps: updatedTimestamps
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error unhiding chat:', error);
    return { success: false, error: error.message };
  }
};

export const getChatHideTimestamp = async (userId, chatId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('chat_hide_timestamps')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.chat_hide_timestamps?.[chatId] || null;
  } catch (error) {
    console.error('Error getting hide timestamp:', error);
    return null;
  }
};

// ============================================
// MESSAGE MODERATION
// ============================================

export const hideMessageAsAdmin = async (messageId, adminId) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_hidden_by_admin: true,
        hidden_by_admin_id: adminId
      })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error hiding message:', error);
    return { success: false, error: error.message };
  }
};

export const unhideMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_hidden_by_admin: false,
        hidden_by_admin_id: null
      })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error unhiding message:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// REPORTING
// ============================================

export const reportMessage = async (reportData) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          reported_by: reportData.reportedBy,
          report_type: 'message',
          reported_message_id: reportData.messageId,
          chat_id: reportData.chatId,
          reason: reportData.reason,
          reporter_contact: reportData.contact,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error reporting message:', error);
    return { success: false, error: error.message };
  }
};

export const reportUser = async (reportData) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          reported_by: reportData.reportedBy,
          report_type: 'user',
          reported_user_id: reportData.userId,
          chat_id: reportData.chatId,
          reason: reportData.reason,
          reporter_contact: reportData.contact,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error reporting user:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// CHAT SETTINGS
// ============================================

export const getChatSettings = async (chatId) => {
  try {
    const { data, error } = await supabase
      .from('chat_settings')
      .select('*')
      .eq('chat_id', chatId)
      .single();

    if (error) {
      // If no settings exist, return defaults
      return { allow_member_invites: false };
    }
    return data;
  } catch (error) {
    console.error('Error getting chat settings:', error);
    return { allow_member_invites: false };
  }
};

export const updateChatSettings = async (chatId, settings) => {
  try {
    const { error } = await supabase
      .from('chat_settings')
      .upsert({
        chat_id: chatId,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating chat settings:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// GROUP MANAGEMENT
// ============================================

export const renameGroup = async (chatId, newName) => {
  try {
    const { error } = await supabase
      .from('chats')
      .update({ name: newName })
      .eq('id', chatId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error renaming group:', error);
    return { success: false, error: error.message };
  }
};

export const removeMemberFromChat = async (chatId, userId) => {
  try {
    const { error } = await supabase
      .from('chat_participants')
      .update({ is_active: false })
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: error.message };
  }
};
