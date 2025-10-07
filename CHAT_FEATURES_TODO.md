# Chat Features Implementation TODO

## Phase 1: Database Schema Changes

### New Tables
- [ ] `chat_admins` table
  - chat_id (uuid, FK to chats)
  - user_id (uuid, FK to users)
  - assigned_by (uuid, FK to users)
  - assigned_at (timestamp)

- [ ] `reports` table
  - id (uuid, primary key)
  - reported_by (uuid, FK to users)
  - report_type (text: 'message' | 'user')
  - reported_message_id (uuid, nullable, FK to chat_messages)
  - reported_user_id (uuid, nullable, FK to users)
  - chat_id (uuid, FK to chats)
  - reason (text)
  - reporter_contact (text)
  - created_at (timestamp)
  - status (text: 'pending' | 'reviewed' | 'resolved')

- [ ] `chat_settings` table
  - chat_id (uuid, primary key, FK to chats)
  - allow_member_invites (boolean, default false)
  - created_at (timestamp)

### New Columns
- [ ] Add `users.blocked_users` (jsonb array)
- [ ] Add `users.chat_hide_timestamps` (jsonb object)
- [ ] Add `chat_participants.can_send` (boolean, default true)
- [ ] Add `chat_messages.is_hidden_by_admin` (boolean, default false)
- [ ] Add `chat_messages.hidden_by_admin_id` (uuid, nullable)

### Data Migration
- [ ] Auto-create chat_admins entry for existing group creators
- [ ] Auto-create chat_settings for existing groups
- [ ] Update "Team Inspire" to "Sons of Thunder"

---

## Phase 2: Backend Helper Functions

- [ ] `isUserAdmin(chatId, userId)` - Check if user is admin
- [ ] `canUserSendInChat(chatId, userId)` - Check all send permissions
- [ ] `getUserBlockedList(userId)` - Get blocked users
- [ ] `hideMessageAsAdmin(messageId, adminId)` - Hide message
- [ ] `toggleMemberSendPermission(chatId, userId, canSend)` - Mute/unmute
- [ ] `assignChatAdmin(chatId, newAdminId, assignedBy)` - Make admin
- [ ] `reportMessage(reportData)` - Create report
- [ ] `reportUser(reportData)` - Create report

---

## Phase 3: Individual Chat Features

### Hide Chat (Local Delete)
- [ ] Add swipe/long-press gesture to chat cards in chatdash.js
- [ ] Create "Hide" button/option
- [ ] Update `users.hidden_chats` array
- [ ] Update `users.chat_hide_timestamps` with current timestamp
- [ ] Filter hidden chats from display in loadUserChats()

### Smart Reappear
- [ ] On new message received, check if chat is hidden
- [ ] If hidden, remove from hidden_chats array
- [ ] Filter messages by timestamp > hide_timestamp when loading

### Block User
- [ ] Add "Block User" option in individual chat header menu
- [ ] Update `users.blocked_users` array
- [ ] Check blocked users before creating DM
- [ ] Filter blocked users' messages from all chats
- [ ] Show "Unblock" option if already blocked

---

## Phase 4: Group Chat - Member List UI

### Member List Modal Component
- [ ] Create `MemberListModal.js` component
- [ ] Show all chat participants with avatars
- [ ] Display admin badge for admins
- [ ] Click member → action menu

### Member Action Menu
- [ ] "Start DM" button (for all users)
- [ ] "Report User" button (for all users)
- [ ] "Mute/Unmute" button (admins only)
- [ ] "Remove from Group" button (admins only)
- [ ] "Make Admin" button (admins only)

### Integration
- [ ] Add "..." icon to chatmessage.js header
- [ ] Open MemberListModal on click
- [ ] Handle individual vs group chat types

---

## Phase 5: Group Chat - Admin Features

### Rename Group
- [ ] Add "Rename Group" option in settings (admins only)
- [ ] Modal with input field
- [ ] Update `chats.name` in database
- [ ] Refresh UI

### Manage Invite Permissions
- [ ] Add toggle: "Anyone can add members" (admins only)
- [ ] Update `chat_settings.allow_member_invites`
- [ ] Enforce in chatcreate.js when adding members

### Message Moderation
- [ ] Add long-press on messages → "Hide Message" (admins only)
- [ ] Update `chat_messages.is_hidden_by_admin` and `hidden_by_admin_id`
- [ ] Filter hidden messages in loadMessages()
- [ ] Show "[Hidden by admin]" tag for admins

### Member Muting
- [ ] Implement mute/unmute from member list
- [ ] Update `chat_participants.can_send`
- [ ] Check permission before allowing message send
- [ ] Show "You have been restricted from sending messages in this group" in input

### Member Removal
- [ ] Implement remove from member list
- [ ] Set `chat_participants.is_active = false`
- [ ] Remove from member list immediately
- [ ] Option to keep or remove their messages (future)

---

## Phase 6: Sons of Thunder Specific

- [ ] Update name from "Team Inspire" to "Sons of Thunder"
- [ ] Ensure creator is auto-admin
- [ ] Add admin assignment UI
- [ ] Prevent leaving (already done with mandatory type)
- [ ] Apply all group admin features

---

## Phase 7: Reporting System

### Report Message
- [ ] Add long-press on any message → "Report Message"
- [ ] Create ReportModal component
- [ ] Fields: reason (textarea), contact info (input)
- [ ] Submit to `reports` table
- [ ] Show success confirmation

### Report User
- [ ] Add "Report User" in member action menu
- [ ] Reuse ReportModal component
- [ ] Submit to `reports` table
- [ ] Show success confirmation

---

## Phase 8: UI/UX Polish

- [ ] Add loading states for all new actions
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add success/error toast notifications
- [ ] Add smooth animations for modals
- [ ] Test on mobile (gestures, modals, inputs)
- [ ] Add haptic feedback for actions (if mobile)

---

## Phase 9: Testing & Bug Fixes

- [ ] Test hide/unhide chat flow
- [ ] Test blocking users in DMs and groups
- [ ] Test admin permissions in groups
- [ ] Test muting/unmuting members
- [ ] Test message hiding
- [ ] Test reporting flow
- [ ] Test edge cases (last admin, self-actions, etc.)
- [ ] Test with multiple users

---

## Phase 10: Future Enhancements

- [ ] Admin dashboard for reviewing reports
- [ ] Notification system for chat events
- [ ] Message reactions
- [ ] Read receipts
- [ ] Typing indicators
- [ ] File/image sharing in chats
