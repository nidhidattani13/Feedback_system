import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import './FeedbackForm.css';

const FeedbackForm = ({ form, onClose }) => {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get student ID from localStorage
      const userDataString = localStorage.getItem('userData');
const userData = userDataString ? JSON.parse(userDataString) : null;
const studentId = userData?.enrollmentNumber;

if (!studentId) {
  toast.error('Student ID missing');
  setLoading(false);
  return;
}

      // Validate responses
      const hasAllResponses = form.questions.every(q => responses[q.id] !== undefined);
      if (!hasAllResponses) {
        toast.error('Please answer all questions');
        setLoading(false);
        return;
      }

      // Format responses correctly according to backend requirements
      const formattedResponses = form.questions.reduce((acc, q) => {
        const response = responses[q.id];
        if (response !== undefined) {
          // Ensure the response is in the correct format based on question type
          let formattedAnswer;
          switch (q.type) {
            case 'short':
            case 'paragraph':
              formattedAnswer = String(response);
              break;
            case 'slider':
              formattedAnswer = Number(response);
              break;
            case 'multiple':
              formattedAnswer = String(response);
              break;
            default:
              formattedAnswer = String(response);
          }
          acc[q.id] = {
            answer: formattedAnswer
          };
        }
        return acc;
      }, {});
      console.log('formId:', form.id);
console.log('studentId:', studentId);
console.log('formattedResponses:', formattedResponses);

      // Submit the form
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/feedback/form/submit', {
        formId: form.id,
        responses: formattedResponses,
        studentId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Form submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data) {
        const { error: errorMessage, details } = error.response.data;
        if (details && details.length > 0) {
          toast.error(`${errorMessage}: Questions ${details.join(', ')} failed validation`);
        } else {
          toast.error(errorMessage || 'Failed to submit form. Please try again.');
        }
      } else {
        toast.error('Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="feedback-form-modal"
    >
      <div className="form-header">
        <h2>{form.title}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {form.questions.map((question) => (
          <div key={question.id} className="question-section">
            <h3>{question.question}</h3>
            {question.type === 'short' && (
              <input
                type="text"
                placeholder="Enter your answer"
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
                className="form-input"
              />
            )}
            {question.type === 'paragraph' && (
              <textarea
                placeholder="Enter your answer"
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
                className="form-textarea"
              />
            )}
            {question.type === 'multiple' && (
              <select
                value={responses[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
                className="form-select"
              >
                <option value="">Select an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            {question.type === 'slider' && (
              <div className="slider-section">
                <input
                  type="range"
                  min={question.min}
                  max={question.max}
                  value={responses[question.id] || question.min}
                  onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
                  required
                  className="form-range"
                />
                <div className="slider-values">
                  <span>{question.min}</span>
                  <span>{question.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;