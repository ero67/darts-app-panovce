import React, { useState } from 'react';
import { Settings, RotateCcw, Edit, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext.jsx';

export function AdminPanel({ match, onAdminAction }) {
  const { isAdmin, isAdminMode, setIsAdminMode, adminFunctions } = useAdmin();
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  if (!isAdmin) {
    return null;
  }

  const handleAdminAction = (action, data) => {
    setShowConfirmDialog({ action, data });
  };

  const confirmAction = () => {
    if (showConfirmDialog) {
      const { action, data } = showConfirmDialog;
      adminFunctions[action](data);
      onAdminAction?.(action, data);
      setShowConfirmDialog(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(null);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <Settings size={20} />
        <span>Admin Controls</span>
        <button 
          className={`admin-toggle ${isAdminMode ? 'active' : ''}`}
          onClick={() => setIsAdminMode(!isAdminMode)}
        >
          {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
        </button>
      </div>

      {isAdminMode && match && (
        <div className="admin-controls">
          <div className="admin-section">
            <h4>Match Controls</h4>
            <div className="admin-buttons">
              <button 
                className="admin-btn reset"
                onClick={() => handleAdminAction('resetMatch', { matchId: match.id })}
              >
                <RotateCcw size={16} />
                Reset Match
              </button>
              
              <button 
                className="admin-btn edit"
                onClick={() => handleAdminAction('correctScore', { matchId: match.id })}
              >
                <Edit size={16} />
                Correct Score
              </button>
              
              <button 
                className="admin-btn adjust"
                onClick={() => handleAdminAction('adjustLegs', { matchId: match.id })}
              >
                <CheckCircle size={16} />
                Adjust Legs
              </button>
              
              <button 
                className="admin-btn force-complete"
                onClick={() => handleAdminAction('forceCompleteMatch', { matchId: match.id })}
              >
                <AlertTriangle size={16} />
                Force Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="admin-confirm-dialog">
          <div className="confirm-content">
            <AlertTriangle className="confirm-icon" />
            <h3>Confirm Admin Action</h3>
            <p>Are you sure you want to perform this admin action? This cannot be undone.</p>
            <div className="confirm-buttons">
              <button className="confirm-btn cancel" onClick={cancelAction}>
                Cancel
              </button>
              <button className="confirm-btn confirm" onClick={confirmAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
