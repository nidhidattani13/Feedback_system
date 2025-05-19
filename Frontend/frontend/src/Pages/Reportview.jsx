import React, { useState, useEffect } from 'react';
import '../styles/ReportView.css';

// Default preset questions for quick form creation
const DEFAULT_PRESET = {
  name: "Default Feedback Form",
  questions: [
    { id: 1, type: "short", label: "What is your name?" },
    { 
      id: 2, 
      type: "slider", 
      label: "How would you rate your overall experience?", 
      min: 1, 
      max: 10, 
      minLabel: "Poor", 
      maxLabel: "Excellent" 
    },
    { 
      id: 3, 
      type: "multiple", 
      label: "Which aspects need improvement?", 
      options: ["Content", "Delivery", "Materials", "Support"]
    },
    { id: 4, type: "paragraph", label: "Additional comments:" }
  ]
};

// Additional presets for better user experience
const ADDITIONAL_PRESETS = [
  {
    name: "Course Evaluation",
    questions: [
      { id: 1, type: "short", label: "Course name and instructor:" },
      { 
        id: 2, 
        type: "slider", 
        label: "Does the faculty come to class on time?", 
        min: 1, 
        max: 10, 
        minLabel: "Very late", 
        maxLabel: "Always on time" 
      },
      { 
        id: 3, 
        type: "slider", 
        label: "How would you rate the clarity of instruction?", 
        min: 1, 
        max: 10, 
        minLabel: "Very unclear", 
        maxLabel: "Very clear" 
      },
      { 
        id: 4, 
        type: "multiple", 
        label: "What teaching methods were most effective?", 
        options: ["Lectures", "Discussions", "Group work", "Practical exercises", "Online resources"]
      },
      { id: 5, type: "paragraph", label: "What suggestions do you have for improving this course?" }
    ]
  },
  {
    name: "Event Feedback",
    questions: [
      { id: 1, type: "short", label: "Event name:" },
      { 
        id: 2, 
        type: "slider", 
        label: "How well was the event organized?", 
        min: 1, 
        max: 10, 
        minLabel: "Poorly organized", 
        maxLabel: "Perfectly organized" 
      },
      { 
        id: 3, 
        type: "multiple", 
        label: "Which aspects of the event did you enjoy most?", 
        options: ["Speakers", "Location", "Networking", "Content", "Activities"]
      },
      { id: 4, type: "paragraph", label: "What suggestions do you have for future events?" }
    ]
  }
];

const ReportView = ({ mode = "admin" }) => {
  // States for managing form creation and display
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentForm, setCurrentForm] = useState({ name: "", questions: [] });
  const [publishedForm, setPublishedForm] = useState(null);
  const [studentResponses, setStudentResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentOptionInput, setCurrentOptionInput] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  // New state to control whether to show published form view
  const [viewingPublishedForm, setViewingPublishedForm] = useState(false);

  // Load presets and published form from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('formPresets');
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    } else {
      // Initialize with default presets if none exist
      const initialPresets = [DEFAULT_PRESET, ...ADDITIONAL_PRESETS];
      setPresets(initialPresets);
      localStorage.setItem('formPresets', JSON.stringify(initialPresets));
    }

    const savedPublishedForm = localStorage.getItem('publishedForm');
    if (savedPublishedForm) {
      setPublishedForm(JSON.parse(savedPublishedForm));
      // If there's a published form, default to showing it
      setViewingPublishedForm(true);
    }
  }, []);

  // Handle preset selection
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCurrentForm({ ...preset });
    setIsCreatingNew(false);
    setViewingPublishedForm(false);
  };

  // Create a new preset
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedPreset(null);
    setCurrentForm({ name: "New Form", questions: [] });
    setViewingPublishedForm(false);
  };

  // Add a new question to the form
  const handleAddQuestion = (type) => {
    const newQuestionId = Date.now();
    let newQuestion = {
      id: newQuestionId,
      type: type,
      label: `New ${type} question`
    };

    // Add type-specific properties
    switch (type) {
      case "multiple":
        newQuestion.options = ["Option 1", "Option 2", "Option 3"];
        break;
      case "slider":
        newQuestion.min = 1;
        newQuestion.max = 10;
        newQuestion.minLabel = "Low";
        newQuestion.maxLabel = "High";
        break;
      default:
        break;
    }

    setCurrentForm({
      ...currentForm,
      questions: [...currentForm.questions, newQuestion]
    });

    setEditingQuestion(newQuestionId);
  };

  // Update question label
  const handleQuestionChange = (id, field, value) => {
    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  // Handle slider properties changes
  const handleSliderChange = (id, field, value) => {
    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.map(q => 
        q.id === id ? { ...q, [field]: field === "min" || field === "max" ? parseInt(value) : value } : q
      )
    });
  };

  // Handle option changes for multiple choice questions
  const handleOptionChange = (questionId, index, newValue) => {
    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.map(q => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions[index] = newValue;
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    });
  };

  // Add a new option to a multiple choice question
  const handleAddOption = (questionId) => {
    if (!currentOptionInput.trim()) return;

    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, currentOptionInput] };
        }
        return q;
      })
    });
    setCurrentOptionInput("");
  };

  // Remove an option from a multiple choice question
  const handleRemoveOption = (questionId, index) => {
    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.map(q => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions.splice(index, 1);
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    });
  };

  // Remove a question from the form
  const handleRemoveQuestion = (id) => {
    setCurrentForm({
      ...currentForm,
      questions: currentForm.questions.filter(q => q.id !== id)
    });
    if (editingQuestion === id) {
      setEditingQuestion(null);
    }
  };

  // Save the current form as a preset
  const handleSavePreset = () => {
    if (currentForm.name.trim() === "") {
      alert("Please provide a name for your form");
      return;
    }

    if (currentForm.questions.length === 0) {
      alert("Please add at least one question to your form");
      return;
    }

    let updatedPresets;
    const existingPresetIndex = presets.findIndex(p => p.name === currentForm.name);

    if (existingPresetIndex >= 0) {
      // Update existing preset
      updatedPresets = [...presets];
      updatedPresets[existingPresetIndex] = { ...currentForm };
    } else {
      // Add new preset
      updatedPresets = [...presets, currentForm];
    }

    setPresets(updatedPresets);
    localStorage.setItem('formPresets', JSON.stringify(updatedPresets));
    alert("Form preset saved successfully!");
  };

  // Publish the current form for students
  const handlePublishForm = () => {
    if (currentForm.questions.length === 0) {
      alert("Please add at least one question before publishing");
      return;
    }

    setPublishedForm(currentForm);
    localStorage.setItem('publishedForm', JSON.stringify(currentForm));
    setViewingPublishedForm(true);
    alert("Form published successfully! Students can now access it.");
  };

  // Handle student input change
  const handleStudentInputChange = (questionId, value) => {
    setStudentResponses({
      ...studentResponses,
      [questionId]: value
    });
  };

  // Handle student multiple choice selection
  const handleMultipleChoiceChange = (questionId, option) => {
    setStudentResponses({
      ...studentResponses,
      [questionId]: option
    });
  };

  // Handle slider value change
  const handleSliderValueChange = (questionId, value) => {
    setStudentResponses({
      ...studentResponses,
      [questionId]: value
    });
  };

  // Submit student responses
  const handleSubmitResponses = () => {
    // Check if all questions are answered
    const unansweredQuestions = publishedForm.questions.filter(
      q => studentResponses[q.id] === undefined || 
           (typeof studentResponses[q.id] === 'string' && studentResponses[q.id].trim() === "")
    );

    if (unansweredQuestions.length > 0) {
      alert("Please answer all questions before submitting");
      return;
    }

    // Save responses to localStorage
    const allResponses = JSON.parse(localStorage.getItem('studentResponses') || '[]');
    const newResponse = {
      id: Date.now(),
      formName: publishedForm.name,
      responses: studentResponses,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem('studentResponses', JSON.stringify([...allResponses, newResponse]));
    setSubmitted(true);
  };

  // Reset the form after submission
  const handleResetForm = () => {
    setStudentResponses({});
    setSubmitted(false);
  };

  // Move a question up in the list
  const handleMoveQuestionUp = (index) => {
    if (index === 0) return;
    const newQuestions = [...currentForm.questions];
    [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    setCurrentForm({
      ...currentForm,
      questions: newQuestions
    });
  };

  // Move a question down in the list
  const handleMoveQuestionDown = (index) => {
    if (index === currentForm.questions.length - 1) return;
    const newQuestions = [...currentForm.questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setCurrentForm({
      ...currentForm,
      questions: newQuestions
    });
  };

  // Toggle back to form list view
  const handleBackToForms = () => {
    setViewingPublishedForm(false);
    setIsCreatingNew(false);
    setSelectedPreset(null);
    setEditingQuestion(null);
  };

  // View the currently published form
  const handleViewPublishedForm = () => {
    setViewingPublishedForm(true);
    setIsCreatingNew(false);
    setSelectedPreset(null);
  };

  // Unpublish the current form
  const handleUnpublishForm = () => {
    if (window.confirm("Are you sure you want to unpublish this form?")) {
      localStorage.removeItem('publishedForm');
      setPublishedForm(null);
      setViewingPublishedForm(false);
      alert("Form has been unpublished.");
    }
  };

  // Render the question editor based on question type
  const renderQuestionEditor = (question) => {
    switch (question.type) {
      case "multiple":
        return (
          <div className="question-options-editor">
            <h4>Options:</h4>
            <ul className="options-list">
              {question.options.map((option, index) => (
                <li key={index} className="option-item">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                    className="option-input"
                  />
                  <button 
                    className="remove-option-btn"
                    onClick={() => handleRemoveOption(question.id, index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="add-option-container">
              <input
                type="text"
                value={currentOptionInput}
                onChange={(e) => setCurrentOptionInput(e.target.value)}
                placeholder="Add new option"
                className="add-option-input"
              />
              <button 
                className="add-option-btn"
                onClick={() => handleAddOption(question.id)}
              >
                Add
              </button>
            </div>
          </div>
        );
      case "slider":
        return (
          <div className="slider-settings">
            <div className="slider-range">
              <div className="slider-setting">
                <label>Min Value:</label>
                <input
                  type="number"
                  value={question.min}
                  onChange={(e) => handleSliderChange(question.id, "min", e.target.value)}
                  min="0"
                  max={question.max - 1}
                />
              </div>
              <div className="slider-setting">
                <label>Max Value:</label>
                <input
                  type="number"
                  value={question.max}
                  onChange={(e) => handleSliderChange(question.id, "max", e.target.value)}
                  min={question.min + 1}
                />
              </div>
            </div>
            <div className="slider-labels">
              <div className="slider-setting">
                <label>Min Label:</label>
                <input
                  type="text"
                  value={question.minLabel}
                  onChange={(e) => handleSliderChange(question.id, "minLabel", e.target.value)}
                  placeholder="Low"
                />
              </div>
              <div className="slider-setting">
                <label>Max Label:</label>
                <input
                  type="text"
                  value={question.maxLabel}
                  onChange={(e) => handleSliderChange(question.id, "maxLabel", e.target.value)}
                  placeholder="High"
                />
              </div>
            </div>
            <div className="slider-preview">
              <span className="min-label">{question.minLabel}</span>
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={(question.min + question.max) / 2}
                disabled
                className="slider-control"
              />
              <span className="max-label">{question.maxLabel}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render question preview based on its type
  const renderQuestionPreview = (question) => {
    switch (question.type) {
      case "short":
        return <input type="text" disabled placeholder="Short answer text field" />;
      case "paragraph":
        return <textarea disabled placeholder="Paragraph text field"></textarea>;
      case "multiple":
        return (
          <div className="multiple-choice-preview">
            {question.options.map((option, index) => (
              <div key={index} className="option-preview">
                <span className="option-dot"></span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        );
      case "slider":
        return (
          <div className="slider-preview-container">
            <span className="slider-min-label">{question.minLabel}</span>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={(question.min + question.max) / 2}
              disabled
              className="slider-preview-control"
            />
            <span className="slider-max-label">{question.maxLabel}</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get question type display name
  const getQuestionTypeDisplay = (type) => {
    switch (type) {
      case "short": return "Short Answer";
      case "paragraph": return "Paragraph";
      case "multiple": return "Multiple Choice";
      case "slider": return "Scale (Slider)";
      default: return type;
    }
  };

  // Render the Published Form Preview (in Admin mode)
  const renderPublishedFormPreview = () => (
    <div className="published-form-preview">
      <div className="published-form-header">
        <div className="published-status">
          <span className="status-indicator"></span>
          <span className="status-text">Published Form</span>
        </div>
        <h2>{publishedForm.name}</h2>
        <p className="form-description">This form is currently published and available to students.</p>
      </div>
      
      <div className="published-form-actions">
        <button className="back-btn" onClick={handleBackToForms}>
          ← Back to Forms
        </button>
        <button className="danger-btn" onClick={handleUnpublishForm}>
          Unpublish Form
        </button>
      </div>
      
      <div className="published-form-questions">
        {publishedForm.questions.map((question, index) => (
          <div key={question.id} className="preview-question-item">
            <div className="preview-question-header">
              <span className="question-number">{index + 1}</span>
              <h3 className="question-text">{question.label}</h3>
            </div>
            <div className="preview-question-content">
              {renderQuestionPreview(question)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render the Admin view
  const renderAdminView = () => (
    <div className="report-admin-view">
      <div className="admin-header">
        <h1>Create Feedback Form</h1>
        <p className="subtitle">Design and publish feedback forms for your students</p>
      </div>
      
      {/* Show Published Form First */}
      {publishedForm && viewingPublishedForm && renderPublishedFormPreview()}
      
      {/* Show Form List or Form Builder */}
      {!viewingPublishedForm && !isCreatingNew && !selectedPreset && (
        <div className="preset-section">
          <div className="section-header">
            <h2>Select a Preset or Create New</h2>
            <div className="section-actions">
              {publishedForm && (
                <button className="view-published-btn" onClick={handleViewPublishedForm}>
                  View Published Form
                </button>
              )}
              <button className="create-new-btn" onClick={handleCreateNew}>Create New Form</button>
            </div>
          </div>
          
          <div className="preset-grid">
            {presets.map((preset, index) => (
              <div 
                key={index} 
                className="preset-card" 
                onClick={() => handleSelectPreset(preset)}
              >
                <div className="preset-card-content">
                  <h3>{preset.name}</h3>
                  <div className="preset-info">
                    <span className="question-count">{preset.questions.length} questions</span>
                  </div>
                  <div className="preset-preview">
                    {preset.questions.slice(0, 2).map((q, i) => (
                      <div key={i} className="preview-question">{q.label}</div>
                    ))}
                    {preset.questions.length > 2 && (
                      <div className="preview-more">+{preset.questions.length - 2} more</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!viewingPublishedForm && (isCreatingNew || selectedPreset) && (
        <div className="form-builder">
          <div className="form-builder-header">
            <input 
              type="text" 
              className="form-title-input" 
              value={currentForm.name}
              onChange={(e) => setCurrentForm({...currentForm, name: e.target.value})}
              placeholder="Form Title"
            />
            <div className="builder-actions">
              <button className="cancel-btn" onClick={() => {
                setIsCreatingNew(false);
                setSelectedPreset(null);
                setEditingQuestion(null);
                if (publishedForm) {
                  setViewingPublishedForm(true);
                }
              }}>Cancel</button>
              <button className="save-preset-btn" onClick={handleSavePreset}>Save Preset</button>
              <button className="publish-form-btn" onClick={handlePublishForm}>Publish Form</button>
            </div>
          </div>

          <div className="questions-container">
            {currentForm.questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`question-item ${editingQuestion === question.id ? 'editing' : ''}`}
                onClick={() => setEditingQuestion(question.id)}
              >
                <div className="question-header">
                  <div className="question-badge">
                    <span className="question-number">{index + 1}</span>
                    <span className="question-type">
                      {getQuestionTypeDisplay(question.type)}
                    </span>
                  </div>
                  <div className="question-controls">
                    <button 
                      className="question-control-btn move-up"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestionUp(index);
                      }}
                      title="Move question up"
                    >
                      ↑
                    </button>
                    <button 
                      className="question-control-btn move-down"
                      disabled={index === currentForm.questions.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestionDown(index);
                      }}
                      title="Move question down"
                    >
                      ↓
                    </button>
                    <button 
                      className="question-control-btn remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(question.id);
                      }}
                      title="Remove question"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  className="question-label"
                  value={question.label}
                  onChange={(e) => handleQuestionChange(question.id, "label", e.target.value)}
                  placeholder="Question text"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {editingQuestion === question.id && renderQuestionEditor(question)}
                
                <div className="question-preview">
                  {renderQuestionPreview(question)}
                </div>
              </div>
            ))}

            {currentForm.questions.length === 0 && (
              <div className="empty-form-message">
                <div className="empty-icon">+</div>
                <h3>No questions yet</h3>
                <p>Use the buttons below to add questions to your form</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <div className="add-question-panel">
              <span className="add-question-label">Add new question:</span>
              <div className="add-question-buttons">
                <button onClick={() => handleAddQuestion("short")}>
                  <span className="btn-icon">+</span> Short Answer
                </button>
                <button onClick={() => handleAddQuestion("paragraph")}>
                  <span className="btn-icon">+</span> Paragraph
                </button>
                <button onClick={() => handleAddQuestion("multiple")}>
                  <span className="btn-icon">+</span> Multiple Choice
                </button>
                <button onClick={() => handleAddQuestion("slider")}>
                  <span className="btn-icon">+</span> Scale (1-10)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the Student view
  const renderStudentView = () => {
    if (!publishedForm) {
      return (
        <div className="report-student-view empty-state">
          <div className="empty-icon">!</div>
          <h2>No feedback forms available</h2>
          <p>Your instructor hasn't published any feedback forms yet.</p>
        </div>
      );
    }

    if (submitted) {
      return (
        <div className="report-student-view submission-complete">
          <div className="success-icon">✓</div>
          <h2>Thank you for your feedback!</h2>
          <p>Your responses have been submitted successfully.</p>
          <button className="reset-form-btn" onClick={handleResetForm}>Submit Another Response</button>
        </div>
      );
    }

    return (
      <div className="report-student-view">
        <div className="student-form-header">
          <h1>{publishedForm.name}</h1>
          <p className="form-description">Please complete this feedback form to help us improve.</p>
        </div>
        
        <form className="student-form" onSubmit={(e) => {
          e.preventDefault();
          handleSubmitResponses();
        }}>
          {publishedForm.questions.map((question, index) => (
            <div key={question.id} className="student-question">
              <div className="question-header">
                <span className="question-number">{index + 1}</span>
                <label>{question.label}</label>
                <span className="required-mark">*</span>
              </div>
              
              {question.type === "short" && (
                <input
                  type="text"
                  value={studentResponses[question.id] || ""}
                  onChange={(e) => handleStudentInputChange(question.id, e.target.value)}
                  placeholder="Your answer"
                />
              )}
              
              {question.type === "paragraph" && (
                <textarea
                  value={studentResponses[question.id] || ""}
                  onChange={(e) => handleStudentInputChange(question.id, e.target.value)}
                  placeholder="Your answer"
                  rows={4}
                ></textarea>
              )}
              
              {question.type === "multiple" && (
                <div className="multiple-choice-options">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="multiple-choice-option">
                      <label className="custom-radio">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={studentResponses[question.id] === option}
                          onChange={() => handleMultipleChoiceChange(question.id, option)}
                        />
                        <span className="radio-mark"></span>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === "slider" && (
                <div className="slider-response">
                  <div className="slider-labels-container">
                    <span className="slider-min-label">{question.minLabel}</span>
                    <span className="slider-max-label">{question.maxLabel}</span>
                  </div>
                  <div className="slider-with-values">
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      value={studentResponses[question.id] || question.min}
                      onChange={(e) => handleSliderValueChange(question.id, parseInt(e.target.value))}
                      className="slider-control"
                    />
                    <div className="slider-value">
                      {studentResponses[question.id] || "-"}
                    </div>
                  </div>
                  <div className="slider-scale">
                    {Array.from({ length: question.max - question.min + 1 }, (_, i) => (
                      <div key={i} className="scale-mark">
                        <div className="scale-tick"></div>
                        <div className="scale-number">{question.min + i}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="form-submit-section">
            <p className="required-note">* All fields are required</p>
            <button type="submit" className="submit-form-btn">Submit Feedback</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="report-view">
      {mode === "admin" ? renderAdminView() : renderStudentView()}
    </div>
  );
};

export default ReportView;