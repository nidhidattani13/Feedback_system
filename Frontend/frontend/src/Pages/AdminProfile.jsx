import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminProfile.css";

const AdminProfile = ({ isOpen, onClose, initialData }) => {
  const [profileData, setProfileData] = useState({
    name: initialData?.name || "Admin User",
    position: initialData?.position || "System Administrator",
    department: initialData?.department || "IT Department",
    email: initialData?.email || "admin@example.com",
    phone: initialData?.phone || "+1 (555) 123-4567",
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

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordError("");
      setSaveSuccess(false);
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
            className="profile-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="profile-header">
              <h2>Admin Profile</h2>
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
                    <p className="position">{profileData.position}</p>
                    <div className="department-badge">{profileData.department}</div>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="profile-section info-section">
                    {saveSuccess && (
                      <div className="success-message">
                        Changes saved successfully!
                      </div>
                    )}

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
                          <label>Position</label>
                          <input
                            type="text"
                            name="position"
                            value={profileData.position}
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
                          <div className="info-label">Position:</div>
                          <div className="info-value">{profileData.position}</div>
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
                      </div>
                    )}
                  </div>

                  <div className="profile-section password-section">
                    <div className="section-header">
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
                          <div className="info-value">March 30, 2025</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminProfile;