import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/FacultyProfile.css";

const FacultyProfile = ({ isOpen, onClose, initialData }) => {
  const [profileData, setProfileData] = useState({
    name: initialData?.name || "Faculty User",
    title: initialData?.title || "Assistant Professor",
    department: initialData?.department || "Computer Science",
    email: initialData?.email || "faculty@example.com",
    phone: initialData?.phone || "+1 (555) 123-4567",
    office: initialData?.office || "Building A, Room 101",
    officeHours: initialData?.officeHours || "Mon, Wed: 2-4 PM",
    researchInterests: initialData?.researchInterests || "Machine Learning, Data Science",
    courses: initialData?.courses || "CS101, CS202, CS350",
    bio: initialData?.bio || "Faculty member with expertise in computer science and related fields.",
    avatar: initialData?.avatar || null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordError("");
      setSaveSuccess(false);
      setActiveTab("general");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSaveProfile = () => {
    // Here you would typically have API call to update the profile
    // For now we'll just simulate a successful save
    setTimeout(() => {
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleChangePassword = () => {
    setPasswordError("");
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    // Here you would typically have API call to update the password
    // For now we'll just simulate a successful update
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
      // For demo purposes we'll just use URL.createObjectURL
      // In a real app, you would upload to server
      setProfileData({
        ...profileData,
        avatar: URL.createObjectURL(file),
      });
    }
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
            className="profile-modal faculty-profile-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="profile-header">
              <h2>Faculty Profile</h2>
              <button className="close-btn" onClick={onClose}>×</button>
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
                    <p className="position">{profileData.title}</p>
                    <div className="department-badge">{profileData.department}</div>
                  </div>
                  
                  <div className="profile-tabs">
                    <button 
                      className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
                      onClick={() => setActiveTab("general")}
                    >
                      General Info
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === "academic" ? "active" : ""}`}
                      onClick={() => setActiveTab("academic")}
                    >
                      Academic
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
                      onClick={() => setActiveTab("security")}
                    >
                      Security
                    </button>
                  </div>
                </div>

                <div className="profile-details">
                  {saveSuccess && (
                    <div className="success-message">
                      Changes saved successfully!
                    </div>
                  )}
                  
                  {activeTab === "general" && (
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
                            />
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <input
                              type="text"
                              name="title"
                              value={profileData.title}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Department</label>
                            <input
                              type="text"
                              name="department"
                              value={profileData.department}
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
                          <div className="form-group">
                            <label>Office Location</label>
                            <input
                              type="text"
                              name="office"
                              value={profileData.office}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div className="form-group span-2">
                            <label>Bio</label>
                            <textarea
                              name="bio"
                              value={profileData.bio}
                              onChange={handleInputChange}
                              rows="4"
                            ></textarea>
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
                            <div className="info-label">Title:</div>
                            <div className="info-value">{profileData.title}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Department:</div>
                            <div className="info-value">{profileData.department}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Email:</div>
                            <div className="info-value">{profileData.email}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Phone:</div>
                            <div className="info-value">{profileData.phone}</div>
                          </div>
                          <div className="info-row">
                            <div className="info-label">Office:</div>
                            <div className="info-value">{profileData.office}</div>
                          </div>
                          <div className="info-row span-2">
                            <div className="info-label">Bio:</div>
                            <div className="info-value bio-text">{profileData.bio}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === "academic" && (
                    <div className="profile-section academic-section">
                      <div className="section-header">
                        <h3>Academic Information</h3>
                        {!isEditing && (
                          <button 
                            className="edit-btn"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Office Hours</label>
                            <input
                              type="text"
                              name="officeHours"
                              value={profileData.officeHours}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group span-2">
                            <label>Research Interests</label>
                            <input
                              type="text"
                              name="researchInterests"
                              value={profileData.researchInterests}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group span-2">
                            <label>Courses Teaching</label>
                            <input
                              type="text"
                              name="courses"
                              value={profileData.courses}
                              onChange={handleInputChange}
                              placeholder="Separate courses with commas"
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
                        <div className="info-display">
                          <div className="info-row">
                            <div className="info-label">Office Hours:</div>
                            <div className="info-value">{profileData.officeHours}</div>
                          </div>
                          <div className="info-row span-2">
                            <div className="info-label">Research Interests:</div>
                            <div className="info-value">{profileData.researchInterests}</div>
                          </div>
                          
                          <div className="info-row span-2">
                            <div className="info-label">Courses:</div>
                            <div className="info-value">
                              <div className="course-badges">
                                {profileData.courses.split(',').map((course, index) => (
                                  <span key={index} className="course-badge">
                                    {course.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="profile-section password-section">
                      <div className="section-header">
                        <h3>Security</h3>
                        {!isChangingPassword && (
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
                            />
                          </div>
                          <div className="form-group">
                            <label>New Password</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                          <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
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
                            <div className="info-value">March 25, 2025</div>
                          </div>
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

export default FacultyProfile;