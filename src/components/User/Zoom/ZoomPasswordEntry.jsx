import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../../assets/css/ForgotPasswordFlow.style.css';

const ZoomPasswordEntry = ({ meetingData, userRole, onPasswordSubmit, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter the meeting password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onPasswordSubmit(password);
    } catch (err) {
      setError('Invalid password. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="form-container">
      <h2 className="FormName">Enter Meeting Password</h2>
      
      <div className="description">
        This meeting requires a password to join. Please enter the password provided by the host.
      </div>

      <div className="form-box">
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="meetingPassword">Meeting Password</label>
            <input
              id="meetingPassword"
              type="password"
              className={`input-field ${error ? 'error' : ''}`}
              placeholder="Enter meeting password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="submit-cancel">
            <div className="submite-field">
              <button
                type="submit"
                className="submit"
                disabled={isSubmitting || !password.trim()}
              >
                {isSubmitting ? 'Joining...' : 'Join Meeting'}
              </button>
              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {meetingData && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '12px',
            width: '100%',
            maxWidth: '320px'
          }}>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              <div><strong>Meeting ID:</strong> {meetingData.meetingId}</div>
              <div><strong>Topic:</strong> {meetingData.topic}</div>
              {userRole && <div><strong>Role:</strong> {userRole}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ZoomPasswordEntry.propTypes = {
  meetingData: PropTypes.shape({
    meetingId: PropTypes.string,
    topic: PropTypes.string
  }),
  userRole: PropTypes.string,
  onPasswordSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ZoomPasswordEntry;