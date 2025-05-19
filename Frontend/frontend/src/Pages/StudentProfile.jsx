import React, { useState, useEffect } from "react";
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
    avatar: null,
  });

  const [academicData, setAcademicData] = useState({
    cgpa: [],
    sgpa: []
  });

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
      const studentId = initialData?.id || "s12345678"; // fallback
      try {
        // In a real app, this would fetch from your API
        const response = await fetch(`http://localhost:5000/api/student/${studentId}`);
        const data = await response.json();
        console.log("Fetched Student Data:", data);
        
        setProfileData({
          id: data.id,
          name: data.name,
          enrollmentNumber: data.enrollmentNumber,
          grNumber: data.grNumber,
          program: data.program,
          batch: data.batch,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar_url || null,
        });
        
        // Set academic data
        setAcademicData({
          cgpa: data.cgpa || [],
          sgpa: data.sgpa || []
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error.message);
        
        // Simulate data for demonstration
        setProfileData({
          id: "s12345678",
          name: "John Doe",
          enrollmentNumber: "EN2021CS001",
          grNumber: "GR9876543",
          program: "B.Tech Computer Science",
          batch: "2021-2025",
          email: "john.doe@example.edu",
          phone: "+91 9876543210",
          avatar: null,
        });
        
        // Simulate academic data
        setAcademicData({
          cgpa: [
            { year: "Year 1 (2021-22)", value: 8.7 },
            { year: "Year 2 (2022-23)", value: 9.1 },
            { year: "Year 3 (2023-24)", value: 9.4 }
          ],
          sgpa: [
            { semester: "Semester 1", value: 8.5, year: "2021" },
            { semester: "Semester 2", value: 8.9, year: "2022" },
            { semester: "Semester 3", value: 9.0, year: "2022" },
            { semester: "Semester 4", value: 9.2, year: "2023" },
            { semester: "Semester 5", value: 9.3, year: "2023" },
            { semester: "Semester 6", value: 9.5, year: "2024" }
          ]
        });
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
      setPasswordError("");
      setSaveSuccess(false);
      setActiveTab("personal");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
    // Basic validation
    if (!profileData.name || !profileData.enrollmentNumber || !profileData.email) {
      alert("Name, Enrollment Number, and Email are required.");
      return;
    }
  
    try {
      // Prepare data for submission
      const submissionData = {
        ...profileData,
        avatar_url: profileData.avatar
      };
      delete submissionData.avatar; // Remove the avatar field
  
      // This would be your actual API call
      let response;
      
      // Simulate API call
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  // Format CGPA/SGPA with coloring based on value
  const getGradeColor = (value) => {
    if (value >= 9.0) return "excellent-grade";
    if (value >= 8.0) return "good-grade";
    if (value >= 7.0) return "average-grade";
    return "below-average-grade";
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
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Profile" 
                        className="profile-avatar"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    {isEditing && (
                      <div className="avatar-upload">
                        <label htmlFor="avatar-input" className="upload-btn">
                          Change Photo
                        </label>
                        <input
                          id="avatar-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    )}
                  </div>

                  <div className="profile-info-brief">
                    <h3>{profileData.name}</h3>
                    <p className="enrollment-number">{profileData.enrollmentNumber}</p>
                    <div className="program-badge">{profileData.program}</div>
                    <div className="batch-info">{profileData.batch}</div>
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
                      </div>
                      
                      {/* CGPA Section */}
                      <div className="academic-block">
                        <h4>Cumulative Grade Point Average (CGPA)</h4>
                        <div className="grades-container">
                          {academicData.cgpa.map((item, index) => (
                            <div key={`cgpa-${index}`} className="grade-card">
                              <div className="grade-year">{item.year}</div>
                              <div className={`grade-value ${getGradeColor(item.value)}`}>
                                {item.value.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Current Overall CGPA */}
                        {academicData.cgpa.length > 0 && (
                          <div className="current-cgpa">
                            <span>Current Overall CGPA:</span>
                            <span className={`grade-value ${getGradeColor(
                              academicData.cgpa[academicData.cgpa.length - 1].value
                            )}`}>
                              {academicData.cgpa[academicData.cgpa.length - 1].value.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* SGPA Section */}
                      <div className="academic-block">
                        <h4>Semester Grade Point Average (SGPA)</h4>
                        <div className="grades-container">
                          {academicData.sgpa.map((item, index) => (
                            <div key={`sgpa-${index}`} className="grade-card">
                              <div className="grade-info">
                                <div className="grade-semester">{item.semester}</div>
                                <div className="grade-year-small">{item.year}</div>
                              </div>
                              <div className={`grade-value ${getGradeColor(item.value)}`}>
                                {item.value.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Semester-wise Performance Chart would go here */}
                      <div className="performance-note">
                        <div className="note-header">Grade Scale</div>
                        <div className="grade-scales">
                          <span className="grade-scale excellent-grade">9.0 - 10.0: Excellent</span>
                          <span className="grade-scale good-grade">8.0 - 8.9: Good</span>
                          <span className="grade-scale average-grade">7.0 - 7.9: Average</span>
                          <span className="grade-scale below-average-grade">&lt; 7.0: Below Average</span>
                        </div>
                      </div>
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