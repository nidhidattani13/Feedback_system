import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import './DailyFeedbackForm.css';

const DailyFeedbackForm = ({ onClose, subjectId, facultyId }) => {
  const [formData, setFormData] = useState({
    lectureRating: 5,
    facultyRating: 5,
    lectureComments: '',
    facultyComments: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjectId || '');
  const [selectedFaculty, setSelectedFaculty] = useState(facultyId || '');

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/subject', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get student ID from localStorage
      const userDataString = localStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const studentId = userData?.enrollmentNumber;

      if (!studentId) {
        toast.error('Student ID missing. Please log in again.');
        setLoading(false);
        return;
      }

      if (!selectedSubject || !selectedFaculty) {
        toast.error('Please select both subject and faculty.');
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const feedbackData = {
        studentId,
        subjectId: selectedSubject,
        facultyId: selectedFaculty,
        lectureDate: today,
        ...formData
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/daily-feedback/submit', feedbackData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Daily feedback submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="daily-feedback-modal"
    >
      <div className="form-header">
        <h2>📝 Daily Feedback Submission</h2>
        <p className="subtitle">Rate today's lecture and faculty performance</p>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Subject Selection */}
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        {/* Faculty Selection */}
        <div className="form-group">
          <label htmlFor="faculty">Faculty Member *</label>
          <select
            id="faculty"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Select faculty member</option>
            {faculty.map((facultyMember) => (
              <option key={facultyMember.email} value={facultyMember.email}>
                {facultyMember.name} - {facultyMember.department}
              </option>
            ))}
          </select>
        </div>

        {/* Lecture Rating */}
        <div className="form-group">
          <label htmlFor="lectureRating">Lecture Rating *</label>
          <div className="rating-container">
            <input
              type="range"
              id="lectureRating"
              min="1"
              max="5"
              value={formData.lectureRating}
              onChange={(e) => handleInputChange('lectureRating', parseInt(e.target.value))}
              className="rating-slider"
            />
            <div className="rating-display">
              <span className="rating-value">{formData.lectureRating}</span>
              <span className="rating-label">{getRatingLabel(formData.lectureRating)}</span>
            </div>
          </div>
          <div className="rating-labels">
            <span>1 - Very Poor</span>
            <span>5 - Excellent</span>
          </div>
        </div>

        {/* Faculty Rating */}
        <div className="form-group">
          <label htmlFor="facultyRating">Faculty Performance Rating *</label>
          <div className="rating-container">
            <input
              type="range"
              id="facultyRating"
              min="1"
              max="5"
              value={formData.facultyRating}
              onChange={(e) => handleInputChange('facultyRating', parseInt(e.target.value))}
              className="rating-slider"
            />
            <div className="rating-display">
              <span className="rating-value">{formData.facultyRating}</span>
              <span className="rating-label">{getRatingLabel(formData.facultyRating)}</span>
            </div>
          </div>
          <div className="rating-labels">
            <span>1 - Very Poor</span>
            <span>5 - Excellent</span>
          </div>
        </div>

        {/* Lecture Comments */}
        <div className="form-group">
          <label htmlFor="lectureComments">Lecture Comments (Optional)</label>
          <textarea
            id="lectureComments"
            placeholder="Share your thoughts about today's lecture content, delivery, or any suggestions for improvement..."
            value={formData.lectureComments}
            onChange={(e) => handleInputChange('lectureComments', e.target.value)}
            className="form-textarea"
            rows="3"
          />
        </div>

        {/* Faculty Comments */}
        <div className="form-group">
          <label htmlFor="facultyComments">Faculty Performance Comments (Optional)</label>
          <textarea
            id="facultyComments"
            placeholder="Share your feedback about the faculty member's teaching style, communication, or any other aspects..."
            value={formData.facultyComments}
            onChange={(e) => handleInputChange('facultyComments', e.target.value)}
            className="form-textarea"
            rows="3"
          />
        </div>

        {/* Important Notice */}
        <div className="notice-box">
          <h4>⚠️ Important Notice</h4>
          <ul>
            <li>Feedback can only be edited within 24 hours of submission</li>
            <li>One feedback per subject per day is allowed</li>
            <li>Your feedback helps improve teaching quality</li>
            <li>All responses are anonymous and confidential</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DailyFeedbackForm; 