// ReportAccess.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ReportAccess.css';

const ReportAccess = ({ publishedForm, allFormResponses = [] }) => {
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // If no responses, show empty state
  if (!allFormResponses || allFormResponses.length === 0 || allFormResponses.every(f => !f.responses || f.responses.length === 0)) {
    return (
      <div className="report-access empty-state">
        <div className="empty-icon">!</div>
        <h2>No responses available</h2>
        <p>There are no responses submitted yet.</p>
      </div>
    );
  }

  // If no form selected, show list of forms to pick
  if (!selectedFormId) {
    return (
      <div className="report-access">
        <h2>View Responses by Form</h2>
        <ul className="form-list">
          {allFormResponses.filter(f => f.responses && f.responses.length > 0).map(form => (
            <li key={form.formId}>
              <button className="form-select-btn" onClick={() => setSelectedFormId(form.formId)}>
                {form.title} ({form.responses.length} responses)
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Find selected form's responses
  const formObj = allFormResponses.find(f => f.formId === selectedFormId);
  const responses = formObj ? formObj.responses : [];
  const formTitle = formObj ? formObj.title : '';

  // Filter responses based on search term
  const filteredResponses = responses.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (response.id && response.id.toString().includes(searchLower)) ||
      (response.student_id && response.student_id.toString().includes(searchLower)) ||
      (response.submitted_at && response.submitted_at.toLowerCase().includes(searchLower))
    );
  });

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleBackToList = () => {
    setSelectedResponse(null);
  };

  const handleBackToForms = () => {
    setSelectedFormId(null);
    setSelectedResponse(null);
  };

  // Render single response detail
  if (selectedResponse) {
    return (
      <div className="report-access response-detail">
        <div className="response-header">
          <button className="back-btn" onClick={handleBackToList}>
            ← Back to Responses
          </button>
          <button className="back-btn" onClick={handleBackToForms}>
            ← Back to Forms
          </button>
          <h2>Response Details</h2>
          <div className="response-meta">
            <span>Submitted: {new Date(selectedResponse.submitted_at).toLocaleString()}</span>
            <span>Student ID: {selectedResponse.student_id}</span>
          </div>
        </div>
        <div className="response-content">
          {formObj && formObj.questions && formObj.questions.length > 0 ? (
            formObj.questions.map((question, index) => (
              <div key={question.id} className="response-question">
                <div className="question-header">
                  <span className="question-number">{index + 1}</span>
                  <h3>{question.label}</h3>
                </div>
                <div className="question-response">
                  {renderResponse(question, selectedResponse.responses[question.id]?.answer)}
                </div>
              </div>
            ))
          ) : (
            <div>No question details available.</div>
          )}
        </div>
      </div>
    );
  }

  // Render list of responses for selected form
  return (
    <div className="report-access">
      <div className="access-header">
        <button className="back-btn" onClick={handleBackToForms}>
          ← Back to Forms
        </button>
        <h2>Responses for: {formTitle}</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredResponses.length === 0 ? (
        <div className="empty-responses">
          <p>No responses have been submitted yet.</p>
        </div>
      ) : (
        <div className="responses-list">
          <div className="list-header">
            <span className="header-id">ID</span>
            <span className="header-student">Student ID</span>
            <span className="header-date">Submitted At</span>
            <span className="header-actions">Actions</span>
          </div>
          {filteredResponses.map(response => (
            <div key={response.id} className="response-item">
              <span className="response-id">{response.id}</span>
              <span className="response-student">{response.student_id}</span>
              <span className="response-date">
                {new Date(response.submitted_at).toLocaleString()}
              </span>
              <div className="response-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewResponse(response)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to render different response types
const renderResponse = (question, response) => {
  if (response === undefined || response === null) return <div className="no-response">No response</div>;
  switch (question.type) {
    case "short":
    case "paragraph":
      return <div className="text-response">{response}</div>;
    case "multiple":
      return <div className="multiple-response">{response}</div>;
    case "slider":
      return (
        <div className="slider-response">
          <div className="slider-value">{response}</div>
          <div className="slider-scale">
            <span>{question.minLabel} ({question.min})</span>
            <span>{question.maxLabel} ({question.max})</span>
          </div>
        </div>
      );
    default:
      return <div className="unknown-response">{JSON.stringify(response)}</div>;
  }
};

export default ReportAccess;