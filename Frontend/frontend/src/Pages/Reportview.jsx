import React, { useState, useEffect } from 'react';
import '../styles/ReportView.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReportAccess from './ReportAccess';

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
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api/feedback';
  // States for managing form creation and display
  const [currentView, setCurrentView] = useState('presets');
  const [activeTab, setActiveTab] = useState('forms');
  
  // Form management states
  const [presets, setPresets] = useState([]);
  const [currentForm, setCurrentForm] = useState({ name: "", questions: [] });
  const [publishedForm, setPublishedForm] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentOptionInput, setCurrentOptionInput] = useState("");
  
  // Student response states
  const [studentResponses, setStudentResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  // Random assigner states
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [lastAssignedIds, setLastAssignedIds] = useState([]);

  // Animation states
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('formPresets');
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    } else {
      const initialPresets = [DEFAULT_PRESET, ...ADDITIONAL_PRESETS];
      setPresets(initialPresets);
      localStorage.setItem('formPresets', JSON.stringify(initialPresets));
    }

    const savedPublishedForm = localStorage.getItem('publishedForm');
    if (savedPublishedForm) {
      setPublishedForm(JSON.parse(savedPublishedForm));
    }
    
    // Load presets from database
    fetchPresets();

    // Load mock student data
    const mockStudents = loadMockStudents();
    setStudents(mockStudents);
    
    const savedAssignedStudents = localStorage.getItem('assignedStudents');
    if (savedAssignedStudents) {
      setAssignedStudents(JSON.parse(savedAssignedStudents));
    }

    const savedLastAssignedIds = localStorage.getItem('lastAssignedIds');
    if (savedLastAssignedIds) {
      setLastAssignedIds(JSON.parse(savedLastAssignedIds));
    }
  }, []);

  // Navigation functions with animations
  const navigateTo = (view, direction = 'forward') => {
    setTransitionDirection(direction);
    setTransitioning(true);
    
    setTimeout(() => {
      setCurrentView(view);
      setTransitioning(false);
    }, 300); // Match this with CSS transition duration
  };

  const handleSelectPreset = (preset) => {
    setCurrentForm({ ...preset });
    navigateTo('builder');
  };

  const handleCreateNew = () => {
    setCurrentForm({ name: "New Form", questions: [] });
    navigateTo('builder');
  };

  const handleBackToPresets = () => {
    navigateTo('presets', 'backward');
  };

  const handleViewPublishedForm = () => {
    navigateTo('published');
  };

  const handleBackFromPublished = () => {
    navigateTo('presets', 'backward');
  };

  // Mock function to generate student data
  const loadMockStudents = () => {
    const mockStudents = [];
    
    for (let i = 0; i < 10; i++) {
      mockStudents.push({
        id: `outstanding-${i}`,
        name: `Outstanding Student ${i + 1}`,
        email: `outstanding${i + 1}@example.com`,
        academicDetails: {
          cgpa: (3.7 + Math.random() * 0.3).toFixed(2)
        }
      });
    }
    
    for (let i = 0; i < 15; i++) {
      mockStudents.push({
        id: `aboveavg-${i}`,
        name: `Above Average Student ${i + 1}`,
        email: `aboveavg${i + 1}@example.com`,
        academicDetails: {
          cgpa: (3.0 + Math.random() * 0.69).toFixed(2)
        }
      });
    }
    
    for (let i = 0; i < 15; i++) {
      mockStudents.push({
        id: `mediocre-${i}`,
        name: `Mediocre Student ${i + 1}`,
        email: `mediocre${i + 1}@example.com`,
        academicDetails: {
          cgpa: (2.0 + Math.random() * 0.99).toFixed(2)
        }
      });
    }
    
    for (let i = 0; i < 10; i++) {
      mockStudents.push({
        id: `low-${i}`,
        name: `Low Performing Student ${i + 1}`,
        email: `low${i + 1}@example.com`,
        academicDetails: {
          cgpa: (Math.random() * 1.99).toFixed(2)
        }
      });
    }
    
    return mockStudents;
  };

  // Classify students based on their CGPA
  const classifyStudents = (students) => {
    const outstanding = students.filter(s => s.academicDetails.cgpa >= 3.7);
    const aboveAvg = students.filter(s => s.academicDetails.cgpa >= 3.0 && s.academicDetails.cgpa < 3.7);
    const mediocre = students.filter(s => s.academicDetails.cgpa >= 2.0 && s.academicDetails.cgpa < 3.0);
    const low = students.filter(s => s.academicDetails.cgpa < 2.0);
    
    return { outstanding, aboveAvg, mediocre, low };
  };

  // Randomly select students with the specified distribution
  const selectRandomStudents = () => {
    const classified = classifyStudents(students);
    
    const availableOutstanding = classified.outstanding.filter(s => !lastAssignedIds.includes(s.id));
    const availableAboveAvg = classified.aboveAvg.filter(s => !lastAssignedIds.includes(s.id));
    const availableMediocre = classified.mediocre.filter(s => !lastAssignedIds.includes(s.id));
    const availableLow = classified.low.filter(s => !lastAssignedIds.includes(s.id));

    const finalOutstanding = availableOutstanding.length >= 3 ? 
      availableOutstanding : classified.outstanding;
    const finalAboveAvg = availableAboveAvg.length >= 3 ? 
      availableAboveAvg : classified.aboveAvg;
    const finalMediocre = availableMediocre.length >= 2 ? 
      availableMediocre : classified.mediocre;
    const finalLow = availableLow.length >= 2 ? 
      availableLow : classified.low;

    const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());
    
    const selectedOutstanding = shuffle(finalOutstanding).slice(0, 3);
    const selectedAboveAvg = shuffle(finalAboveAvg).slice(0, 3);
    const selectedMediocre = shuffle(finalMediocre).slice(0, 2);
    const selectedLow = shuffle(finalLow).slice(0, 2);

    const selectedStudents = [
      ...selectedOutstanding,
      ...selectedAboveAvg,
      ...selectedMediocre,
      ...selectedLow
    ];

    const selectedIds = selectedStudents.map(s => s.id);
    setLastAssignedIds(selectedIds);
    localStorage.setItem('lastAssignedIds', JSON.stringify(selectedIds));

    return selectedStudents;
  };

  // Handle student assignment
  const handleAssignStudents = () => {
    const selectedStudents = selectRandomStudents();
    setAssignedStudents(selectedStudents);
    localStorage.setItem('assignedStudents', JSON.stringify(selectedStudents));
  };

  // Add a new question to the form
  const handleAddQuestion = (type) => {
    const newQuestionId = Date.now();
    let newQuestion = {
      id: newQuestionId,
      type: type,
      label: `New ${type} question`
    };

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

  // Load form data from backend
  useEffect(() => {
    if (mode === 'student') {
      // Student mode: fetch latest form
      fetchLatestForm();
    } else {
      // Admin mode: fetch all forms
      fetchAllForms();
    }
  }, [mode]);

  // Fetch latest form for students
  const fetchLatestForm = async () => {
    try {
      const response = await axios.get(`${API_URL}/form/latest`);
      setPublishedForm(response.data);
      setViewingPublishedForm(true);
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Error loading feedback form. Please try again later.');
    }
  };

  // Fetch all forms for admin
  const fetchAllForms = async () => {
    try {
      const response = await axios.get(`${API_URL}/form`);
      setPresets(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Error loading feedback forms. Please try again later.');
    }
  };

  // Save preset to database
  const handleSavePreset = async () => {
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
      updatedPresets = [...presets];
      updatedPresets[existingPresetIndex] = { ...currentForm };
    } else {
      updatedPresets = [...presets, currentForm];
    }
  };

  // Fetch presets from database
  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API_URL}/presets`);
      setPresets(response.data);
    } catch (error) {
      console.error('Error fetching presets:', error);
      alert('Error loading presets. Please try again.');
    }
  };

  // Delete a preset form
  const handleDeletePreset = async (presetId) => {
    if (window.confirm("Are you sure you want to delete this preset?")) {
      try {
        await axios.delete(`${API_URL}/preset/${presetId}`);
        // Update presets list
        fetchPresets();
      } catch (error) {
        console.error('Error deleting preset:', error);
        alert('Error deleting preset. Please try again.');
      }
    }
  };
  const handlePublishForm = async () => {
    if (currentForm.questions.length === 0) {
      alert("Please add at least one question before publishing");
      return;
    }

    setPublishedForm(currentForm);
    localStorage.setItem('publishedForm', JSON.stringify(currentForm));
    navigateTo('published');
    alert("Form published successfully! Now you can assign it to students.");
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
    const unansweredQuestions = publishedForm.questions.filter(
      q => studentResponses[q.id] === undefined || 
           (typeof studentResponses[q.id] === 'string' && studentResponses[q.id].trim() === "")
    );

    if (unansweredQuestions.length > 0) {
      alert("Please answer all questions before submitting");
      return;
    }

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

  // Unpublish the current form
  const handleUnpublishForm = () => {
    if (window.confirm("Are you sure you want to unpublish this form?")) {
      localStorage.removeItem('publishedForm');
      setPublishedForm(null);
      setAssignedStudents([]);
      localStorage.removeItem('assignedStudents');
      localStorage.removeItem('lastAssignedIds');
      navigateTo('presets', 'backward');
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

  // Render the Random Assigner component
  const renderRandomAssigner = () => {
    const classified = classifyStudents(students);
    
    return (
      <div className="random-assigner">
        <h3>Random Student Assignment</h3>
        <p>
          This tool will randomly select 10 students to receive the feedback form:
          <br />
          3 Outstanding (CGPA ≥ 3.7), 3 Above Average (3.0-3.69), 
          2 Mediocre (2.0-2.99), and 2 Low (CGPA &lt; 2.0).
        </p>
        
        <div className="student-counts">
          <div className="count-item">
            <span className="count-label">Outstanding:</span>
            <span className="count-value">{classified.outstanding.length}</span>
          </div>
          <div className="count-item">
            <span className="count-label">Above Average:</span>
            <span className="count-value">{classified.aboveAvg.length}</span>
          </div>
          <div className="count-item">
            <span className="count-label">Mediocre:</span>
            <span className="count-value">{classified.mediocre.length}</span>
          </div>
          <div className="count-item">
            <span className="count-label">Low:</span>
            <span className="count-value">{classified.low.length}</span>
          </div>
        </div>

        <button 
          className="assign-btn"
          onClick={handleAssignStudents}
          disabled={assignedStudents.length > 0}
        >
          {assignedStudents.length > 0 ? 'Students Assigned' : 'Assign Random Students'}
        </button>

        {assignedStudents.length > 0 && (
          <div className="assignment-success">
            <p>Students have been successfully assigned to this feedback form.</p>
            <div className="assignment-summary">
              <h4>Assignment Status</h4>
              <p>10 students have been randomly selected to receive this feedback form.</p>
              <div className="student-count-info">
                <div className="student-count-item">
                  <span className="count-label">Total Students Selected:</span>
                  <span className="count-value">{assignedStudents.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the Presets view
  const renderPresetsView = () => (
    <div className={`view-container ${transitioning && transitionDirection === 'forward' ? 'slide-out-left' : ''} ${transitioning && transitionDirection === 'backward' ? 'slide-in-right' : ''}`}>
      <div className="preset-section">
        <div className="section-header">
          <h2>Select a Preset or Create New</h2>
          <div className="section-actions">
            {publishedForm && (
              <button 
                className="view-published-btn"
                onClick={handleViewPublishedForm}
              >
                View Published Form
              </button>
            )}
            <button 
              className="create-new-btn"
              onClick={handleCreateNew}
            >
              Create New Form
            </button>
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
    </div>
  );

  // Render the Form Builder view
  const renderBuilderView = () => (
    <div className={`view-container ${transitioning && transitionDirection === 'forward' ? 'slide-out-left' : ''} ${transitioning && transitionDirection === 'backward' ? 'slide-in-right' : ''}`}>
      <div className="form-builder">
        <div className="form-builder-header">
          <button 
            className="back-button"
            onClick={handleBackToPresets}
          >
            ← Back to Presets
          </button>
          <input 
            type="text" 
            className="form-title-input" 
            value={currentForm.name}
            onChange={(e) => setCurrentForm({...currentForm, name: e.target.value})}
            placeholder="Form Title"
          />
          <div className="builder-actions">
            <button 
              className="save-preset-btn"
              onClick={handleSavePreset}
            >
              Save Preset
            </button>
            <button 
              className="publish-form-btn"
              onClick={handlePublishForm}
            >
              Publish Form
            </button>
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
    </div>
  );

  // Render the Published Form view
  const renderPublishedView = () => (
    <div className={`view-container ${transitioning && transitionDirection === 'forward' ? 'slide-out-left' : ''} ${transitioning && transitionDirection === 'backward' ? 'slide-in-right' : ''}`}>
      <div className="published-form-preview">
        <div className="published-form-header">
          <button 
            className="back-button"
            onClick={handleBackFromPublished}
          >
            ← Back to Presets
          </button>
          <div className="published-status">
            <span className="status-indicator"></span>
            <span className="status-text">Published Form</span>
          </div>
          <h2>{publishedForm.name}</h2>
          <p className="form-description">This form is currently published and available to students.</p>
        </div>
        
        <div className="published-form-actions">
          <button 
            className="danger-btn"
            onClick={handleUnpublishForm}
          >
            Unpublish Form
          </button>
        </div>
        
        <div className="random-assigner-container">
          {renderRandomAssigner()}
        </div>
        
        <div className="published-form-questions">
          <h3 className="questions-section-title">Form Preview</h3>
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
    </div>
  );

  // Render the Admin view
  const renderAdminView = () => {
    const renderTabContent = () => {
      switch (currentView) {
        case 'presets':
          return renderPresetsView();
        case 'builder':
          return renderBuilderView();
        case 'published':
          return renderPublishedView();
        default:
          return renderPresetsView();
      }
    };

    return (
      <div className="report-admin-view">
        <div className="admin-header">
          <h1>Feedback Form Management</h1>
          <p className="subtitle">Design forms and view student responses</p>
        </div>
        
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
            onClick={() => setActiveTab('forms')}
          >
            Form Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => setActiveTab('responses')}
          >
            View Responses
          </button>
        </div>
        
        {activeTab === 'forms' ? renderTabContent() : <ReportAccess publishedForm={publishedForm} />}
      </div>
    );
  };

  // Render the Student view
  const renderStudentView = () => {
    const isAssigned = assignedStudents.some(s => s.id === 'current-student-id');

    if (!isAssigned) {
      return (
        <div className="report-student-view empty-state">
          <div className="empty-icon">!</div>
          <h2>No feedback forms assigned to you</h2>
          <p>You haven't been selected to complete this feedback form.</p>
        </div>
      );
    }

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