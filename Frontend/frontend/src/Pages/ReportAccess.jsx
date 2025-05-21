// ReportAccess.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ReportAccess.css';

const ReportAccess = ({ publishedForm }) => {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load responses from localStorage
  useEffect(() => {
    const loadResponses = () => {
      const savedResponses = localStorage.getItem('studentResponses');
      if (savedResponses) {
        const parsedResponses = JSON.parse(savedResponses);
        // Filter responses for the current form
        const formResponses = publishedForm 
          ? parsedResponses.filter(r => r.formName === publishedForm.name)
          : [];
        setResponses(formResponses);
      }
      setIsLoading(false);
    };

    loadResponses();
  }, [publishedForm]);

  // Filter responses based on search term
  const filteredResponses = responses.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    return (
      response.id.toString().includes(searchLower) ||
      response.submittedAt.toLowerCase().includes(searchLower)
    );
  });

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleBackToList = () => {
    setSelectedResponse(null);
  };

  const handleDeleteResponse = (responseId) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      const updatedResponses = responses.filter(r => r.id !== responseId);
      setResponses(updatedResponses);
      localStorage.setItem('studentResponses', JSON.stringify(updatedResponses));
      if (selectedResponse && selectedResponse.id === responseId) {
        setSelectedResponse(null);
      }
    }
  };

  if (!publishedForm) {
    return (
      <div className="report-access empty-state">
        <div className="empty-icon">!</div>
        <h2>No form published</h2>
        <p>There is no form currently published to view responses.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="report-access loading">
        <div className="spinner"></div>
        <p>Loading responses...</p>
      </div>
    );
  }

  if (selectedResponse) {
    return (
      <div className="report-access response-detail">
        <div className="response-header">
          <button className="back-btn" onClick={handleBackToList}>
            ← Back to Responses
          </button>
          <h2>Response Details</h2>
          <div className="response-meta">
            <span>Submitted: {new Date(selectedResponse.submittedAt).toLocaleString()}</span>
            <button 
              className="delete-btn"
              onClick={() => handleDeleteResponse(selectedResponse.id)}
            >
              Delete Response
            </button>
          </div>
        </div>

        <div className="response-content">
          {publishedForm.questions.map((question, index) => (
            <div key={question.id} className="response-question">
              <div className="question-header">
                <span className="question-number">{index + 1}</span>
                <h3>{question.label}</h3>
              </div>
              <div className="question-response">
                {renderResponse(question, selectedResponse.responses[question.id])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="report-access">
      <div className="access-header">
        <h2>Student Responses for: {publishedForm.name}</h2>
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
            <span className="header-date">Submitted At</span>
            <span className="header-actions">Actions</span>
          </div>
          {filteredResponses.map(response => (
            <div key={response.id} className="response-item">
              <span className="response-id">{response.id}</span>
              <span className="response-date">
                {new Date(response.submittedAt).toLocaleString()}
              </span>
              <div className="response-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewResponse(response)}
                >
                  View
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteResponse(response.id)}
                >
                  Delete
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
  if (!response) return <div className="no-response">No response</div>;

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