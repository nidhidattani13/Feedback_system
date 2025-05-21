import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import "../styles/StudentProfile.css";

const StudentProfile = ({ isOpen, onClose, initialData }) => {
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    enrollmentNumber: "",
    grNumber: "",
    program: "",
    batch: "",
    email: "",
    phone: "",
  });

  const [academicData, setAcademicData] = useState({
    sgpa: []
  });

  // New state for editing academic data
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [newSgpaEntry, setNewSgpaEntry] = useState({ semester: "", year: "", value: "" });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // personal, academic

  // Fetch student data on modal open
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const enrollmentNumber = localStorage.getItem("enrollment") ;
        
        // First: Try to get student by enrollment number
        const idRes = await fetch(`http://localhost:5000/api/students/enroll/${enrollmentNumber}`);
        
        if (idRes.status === 404) {
          // If not found, keep everything empty
          setProfileData({
            id: "",
            name: "",
            enrollmentNumber: "",
            grNumber: "",
            program: "",
            batch: "",
            email: "",
            phone: ""
          });
          setAcademicData({ sgpa: [] });
          return;
        }
        if (!idRes.ok) {
          const errorText = await idRes.text();
          console.error(`Failed to fetch student: ${errorText}`);
          throw new Error('Student not found or server error');
        }

        const idData = await idRes.json();
        
        if (idRes.ok) {
          // If student exists, get ID from response
          const studentId = idData.id;
          
          // Fetch full profile by ID
          const profileRes = await fetch(`http://localhost:5000/api/students/${studentId}`);
          
          if (!profileRes.ok) {
            const errorText = await profileRes.text();
            console.error(`Failed to fetch profile: ${errorText}`);
            throw new Error('Failed to fetch profile data');
          }

          const profileData = await profileRes.json();

          if (profileRes.ok && profileData) {
            setProfileData({
              id: profileData.id,
              name: profileData.name || "",
              enrollmentNumber: profileData.enrollmentNumber || "",
              grNumber: profileData.grNumber || "",
              program: profileData.program || "",
              batch: profileData.batch || "",
              email: profileData.email || "",
              phone: profileData.phone || ""
            });
            
            setAcademicData({
              sgpa: profileData.sgpa || []
            });
          } else {
            throw new Error('Failed to fetch profile data');
          }
        } else {
          // If student doesn't exist, create new profile
          const createRes = await fetch('http://localhost:5000/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              enrollmentNumber: initialData?.enrollmentNumber || "",
              name: initialData?.name || "",
              grNumber: initialData?.grNumber || "",
              program: initialData?.program || "",
              batch: initialData?.batch || "",
              email: initialData?.email || "",
              phone: initialData?.phone || ""
            })
          });
          
          if (!createRes.ok) {
            throw new Error('Failed to create profile');
          }
          
          // After creation, get the ID
          const createData = await createRes.json();
          const studentId = createData.id;
          
          // Fetch the newly created profile
          const profileRes = await fetch(`http://localhost:5000/students/${studentId}`);
          const profileData = await profileRes.json();
          
          if (profileRes.ok && profileData) {
            setProfileData({
              id: profileData.id,
              name: profileData.name || "",
              enrollmentNumber: profileData.enrollmentNumber || "",
              grNumber: profileData.grNumber || "",
              program: profileData.program || "",
              batch: profileData.batch || "",
              email: profileData.email || "",
              phone: profileData.phone || ""
            });
            
            setAcademicData({
              sgpa: profileData.sgpa || []
            });
          } else {
            throw new Error('Failed to fetch created profile');
          }
        }
      } catch (error) {
        console.error("Failed to fetch student profile:", error.message);
        toast.error(error.message || "Failed to load profile. Please try again.");
      }
    };

    if (isOpen) {
      fetchStudentProfile();
    }
  }, [isOpen, initialData]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setIsChangingPassword(false);
      setIsEditingAcademic(false);
      setPasswordError("");
      setSaveSuccess(false);
      setActiveTab("personal");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setNewSgpaEntry({ semester: "", year: "", value: "" });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    // Ensure we have all required fields
    if (!profileData.name || !profileData.enrollmentNumber || !profileData.email) {
      alert("Name, Enrollment Number, and Email are required.");
      return;
    }

    // Generate a unique enrollment number if not provided
    if (!profileData.enrollmentNumber.trim()) {
      const timestamp = new Date().getTime();
      profileData.enrollmentNumber = `EN${timestamp}`;
    }
  
    try {
      const submissionData = {
        name: profileData.name,
        enrollmentNumber: profileData.enrollmentNumber, // Use snake_case for database
        grNumber: profileData.grNumber, // Use snake_case for database
        program: profileData.program,
        batch: profileData.batch,
        email: profileData.email,
        phone: profileData.phone,
      };

      let response;
      
      // Check if we have an ID (existing profile)
      if (profileData.id) {
        response = await fetch(`http://localhost:5000/api/students/${profileData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        });
      } else {
        // Create new profile
        response = await fetch(`http://localhost:5000/api/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const data = await response.json();
      
      // Update local state with new/updated ID
      setProfileData(prev => ({
        ...prev,
        id: data.data?.id || prev.id
      }));

      // Save academic data if available
      if (academicData.sgpa.length > 0) {
        await saveAcademicData();
      }

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save profile: " + error.message);
      console.error(error);
    }
  };


  
  const handleChangePassword = () => {
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    // Simulate success
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // Handle SGPA input change
  const handleSgpaInputChange = (e) => {
    const { name, value } = e.target;
    setNewSgpaEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new SGPA entry
  const addSgpaEntry = () => {
    // Validate inputs
    if (!newSgpaEntry.semester || !newSgpaEntry.year || !newSgpaEntry.value) {
      alert("Semester, Year, and SGPA value are required.");
      return;
    }
    
    const sgpaValue = parseFloat(newSgpaEntry.value);
    if (isNaN(sgpaValue) || sgpaValue < 0 || sgpaValue > 10) {
      alert("Please enter a valid SGPA value between 0 and 10.");
      return;
    }

    // Extract semester number for sorting
    const semesterNum = parseInt(newSgpaEntry.semester.replace(/\D/g, '')) || 0;

    setAcademicData(prev => ({
      ...prev,
      sgpa: [...prev.sgpa, { 
        ...newSgpaEntry, 
        value: sgpaValue,
        semesterNum: semesterNum // Store semester number for sorting
      }]
    }));
    
    // Reset input
    setNewSgpaEntry({ semester: "", year: "", value: "" });
  };

  // Remove SGPA entry
  const removeSgpaEntry = (index) => {
    setAcademicData(prev => ({
      ...prev,
      sgpa: prev.sgpa.filter((_, i) => i !== index)
    }));
  };

  // Save academic data
  const saveAcademicData = async () => {
    try {
      // Here you would send the SGPA data to your backend
      const response = await fetch(`http://localhost:5000/api/student/${profileData.id}/academic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sgpa: academicData.sgpa
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save academic data");
      }

      setIsEditingAcademic(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save academic data: " + error.message);
      console.error(error);
    }
  };

  // Format SGPA/CGPA with coloring based on value
  const getGradeColor = (value) => {
    if (value >= 9.0) return "excellent-grade";
    if (value >= 8.0) return "good-grade";
    if (value >= 7.0) return "average-grade";
    return "below-average-grade";
  };

  // Calculate current CGPA from SGPA values
  const calculateCGPA = () => {
    if (academicData.sgpa.length === 0) return null;
    
    const total = academicData.sgpa.reduce((sum, item) => sum + parseFloat(item.value), 0);
    return (total / academicData.sgpa.length).toFixed(2);
  };

  // Sort SGPA entries by semester number (for display)
  const sortedSgpaEntries = () => {
    return [...academicData.sgpa].sort((a, b) => {
      // Extract semester numbers if they exist
      const aNum = a.semesterNum || parseInt(a.semester.replace(/\D/g, '')) || 0;
      const bNum = b.semesterNum || parseInt(b.semester.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="profile-modal student-profile-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="profile-header">
              <h2>Student Profile</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="profile-tabs">
              <button 
                className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button 
                className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                Academic Record
              </button>
            </div>

            <div className="profile-content">
              <div className="profile-grid">
                <div className="profile-sidebar">
                  <div className="avatar-section">
                    <div className="avatar-placeholder">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  <div className="profile-info-brief">
                    <h3>{profileData.name}</h3>
                    <p className="enrollment-number">{profileData.enrollmentNumber}</p>
                    <div className="program-badge">{profileData.program}</div>
                    <div className="batch-info">{profileData.batch}</div>
                    
                    {/* Display CGPA in sidebar for quick reference */}
                    {calculateCGPA() && (
                      <div className="cgpa-sidebar">
                        <div className="cgpa-label">Current CGPA</div>
                        <div className={`cgpa-value ${getGradeColor(calculateCGPA())}`}>
                          {calculateCGPA()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-details">
                  {saveSuccess && (
                    <div className="success-message">
                      Changes saved successfully!
                    </div>
                  )}

                  {/* Personal Information Tab */}
                  {activeTab === 'personal' && (
                    <div className="profile-section info-section">
                      <div className="section-header">
                        <h3>Personal Information</h3>
                        {!isEditing && !isChangingPassword && (
                          <button 
                            className="edit-btn"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        // Edit mode form
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Enrollment Number</label>
                            <input
                              type="text"
                              name="enrollmentNumber"
                              value={profileData.enrollmentNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>GR Number</label>
                            <input
                              type="text"
                              name="grNumber"
                              value={profileData.grNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Program</label>
                            <input
                              type="text"
                              name="program"
                              value={profileData.program}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Batch</label>
                            <input
                              type="text"
                              name="batch"
                              value={profileData.batch}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone</label>
                            <input
                              type="text"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="button-row">
                            <button 
                              className="cancel-button"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="confirm-button"
                              onClick={handleSaveProfile}
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="info-display">
                          <div className="info-row">
                            <div className="info-label">Name:</div>
                            <div className="info-value">{profileData.name}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Enrollment Number:</div>
                            <div className="info-value">{profileData.enrollmentNumber}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">GR Number:</div>
                            <div className="info-value">{profileData.grNumber}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Program:</div>
                            <div className="info-value">{profileData.program}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Batch:</div>
                            <div className="info-value">{profileData.batch}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Email:</div>
                            <div className="info-value">{profileData.email}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Phone:</div>
                            <div className="info-value">{profileData.phone}</div>
                          </div>
                        </div>
                      )}

                      {/* Security Section */}
                      <div className="section-header mt-4">
                        <h3>Security</h3>
                        {!isChangingPassword && !isEditing && (
                          <button 
                            className="edit-btn"
                            onClick={() => setIsChangingPassword(true)}
                          >
                            Change Password
                          </button>
                        )}
                      </div>

                      {isChangingPassword ? (
                        <div className="password-form">
                          {passwordError && (
                            <div className="error-message">
                              {passwordError}
                            </div>
                          )}
                          <div className="form-group">
                            <label>Current Password</label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>New Password</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          <div className="button-row">
                            <button 
                              className="cancel-button"
                              onClick={() => setIsChangingPassword(false)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="confirm-button"
                              onClick={handleChangePassword}
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="password-display">
                          <div className="info-row">
                            <div className="info-label">Password:</div>
                            <div className="info-value">••••••••</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Last changed:</div>
                            <div className="info-value">April 15, 2025</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Academic Records Tab */}
                  {activeTab === 'academic' && (
                    <div className="profile-section academic-section">
                      <div className="section-header">
                        <h3>Academic Records</h3>
                        {!isEditingAcademic ? (
                          <button 
                            className="edit-btn"
                            onClick={() => setIsEditingAcademic(true)}
                          >
                            Edit
                          </button>
                        ) : (
                          <button 
                            className="confirm-button"
                            onClick={saveAcademicData}
                          >
                            Save
                          </button>
                        )}
                      </div>
                      
                      {/* Current CGPA Display */}
                      <div className="academic-block">
                        <h4>Cumulative Grade Point Average (CGPA)</h4>
                        
                        {calculateCGPA() ? (
                          <div className="current-cgpa">
                            <div className="cgpa-card">
                              <div className="cgpa-header">Current CGPA</div>
                              <div className={`cgpa-value-large ${getGradeColor(calculateCGPA())}`}>
                                {calculateCGPA()}
                              </div>
                              <div className="cgpa-note">
                                Calculated from all semester performances
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p>CGPA will be calculated from your semester-wise SGPA entries.</p>
                          </div>
                        )}
                      </div>

                      {/* SGPA Section */}
                      <div className="academic-block">
                        <h4>Semester Grade Point Average (SGPA)</h4>
                        
                        {isEditingAcademic && (
                          <div className="add-grade-form">
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Semester</label>
                                <input
                                  type="text"
                                  name="semester"
                                  placeholder="e.g., Semester 1"
                                  value={newSgpaEntry.semester}
                                  onChange={handleSgpaInputChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>Academic Year</label>
                                <input
                                  type="text"
                                  name="year"
                                  placeholder="e.g., 2021"
                                  value={newSgpaEntry.year}
                                  onChange={handleSgpaInputChange}
                                />
                              </div>
                              <div className="form-group">
                                <label>SGPA Value</label>
                                <input
                                  type="number"
                                  name="value"
                                  placeholder="e.g., 8.5"
                                  min="0"
                                  max="10"
                                  step="0.01"
                                  value={newSgpaEntry.value}
                                  onChange={handleSgpaInputChange}
                                />
                              </div>
                              <div className="form-group">
                                <button 
                                  className="add-button"
                                  onClick={addSgpaEntry}
                                >
                                  Add SGPA Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {academicData.sgpa.length > 0 ? (
                          <div className="grades-container">
                            {sortedSgpaEntries().map((item, index) => (
                              <div key={`sgpa-${index}`} className="grade-card">
                                <div className="grade-info">
                                  <div className="grade-semester">{item.semester}</div>
                                  <div className="grade-year-small">{item.year}</div>
                                </div>
                                <div className={`grade-value ${getGradeColor(item.value)}`}>
                                  {parseFloat(item.value).toFixed(2)}
                                </div>
                                {isEditingAcademic && (
                                  <button 
                                    className="remove-btn"
                                    onClick={() => removeSgpaEntry(index)}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <p>No SGPA records added yet. {isEditingAcademic ? 'Use the form above to add your SGPA.' : 'Click Edit to add your SGPA records.'}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Grade Scale Legend */}
                      <div className="performance-note">
                        <div className="note-header">Grade Scale</div>
                        <div className="grade-scales">
                          <span className="grade-scale excellent-grade">9.0 - 10.0: Excellent</span>
                          <span className="grade-scale good-grade">8.0 - 8.9: Good</span>
                          <span className="grade-scale average-grade">7.0 - 7.9: Average</span>
                          <span className="grade-scale below-average-grade">&lt; 7.0: Below Average</span>
                        </div>
                      </div>
                      
                      {isEditingAcademic && (
                        <div className="button-row mt-4">
                          <button 
                            className="cancel-button"
                            onClick={() => setIsEditingAcademic(false)}
                          >
                            Cancel
                          </button>
                          <button 
                            className="confirm-button"
                            onClick={saveAcademicData}
                          >
                            Save Academic Data
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StudentProfile;