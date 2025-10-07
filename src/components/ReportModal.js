import React, { useState } from 'react';
import { reportMessage, reportUser } from '../utils/chatHelpers';
import './ReportModal.css';

function ReportModal({ type, data, currentUserId, chatId, onClose }) {
  const [reason, setReason] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for this report');
      return;
    }

    setSubmitting(true);

    try {
      let result;

      if (type === 'message') {
        result = await reportMessage({
          reportedBy: currentUserId,
          messageId: data.messageId,
          chatId: chatId,
          reason: reason.trim(),
          contact: contact.trim()
        });
      } else if (type === 'user') {
        result = await reportUser({
          reportedBy: currentUserId,
          userId: data.userId,
          chatId: chatId,
          reason: reason.trim(),
          contact: contact.trim()
        });
      }

      if (result.success) {
        alert('Report submitted successfully. An admin will review it.');
        onClose();
      } else {
        alert('Error submitting report: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (type === 'message') return 'Report Message';
    if (type === 'user') return `Report ${data.userName || 'User'}`;
    return 'Report';
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="report-modal-body">
          <p className="report-description">
            {type === 'message'
              ? 'Please describe why you are reporting this message. This will be reviewed by our team.'
              : 'Please describe why you are reporting this user. This will be reviewed by our team.'}
          </p>

          {type === 'message' && data.messageText && (
            <div className="reported-message-preview">
              <p className="preview-label">Reported message:</p>
              <p className="preview-text">"{data.messageText}"</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason">Reason for report *</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue..."
              rows="4"
              disabled={submitting}
              maxLength={500}
            />
            <span className="char-count">{reason.length}/500</span>
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact info (optional)</label>
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or phone for follow-up"
              disabled={submitting}
            />
            <span className="help-text">
              Provide contact info if you'd like us to reach you about this report
            </span>
          </div>

          <div className="report-actions">
            <button
              className="submit-report-btn"
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
            >
              {submitting ? (
                <>
                  <div className="button-spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  Submit Report
                </>
              )}
            </button>

            <button
              className="cancel-report-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
