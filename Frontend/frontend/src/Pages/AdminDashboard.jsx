import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminDashboard.css";
import AdminProfile from "./AdminProfile";

const AdminDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [notices, setNotices] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectInfo, setNewSubjectInfo] = useState("");
  const [newFaculty, setNewFaculty] = useState("");
  const [newFacultyInfo, setNewFacultyInfo] = useState("");
  const [newFacultyDepartment, setNewFacultyDepartment] = useState("");
  const [newNotice, setNewNotice] = useState("");
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  // Sample admin data for the profile
  const adminData = {
    name: "Admin User",
    position: "System Administrator",
    department: "IT Department",
    email: "admin@example.com",
    phone: "+1 (555) 123-4567",
    avatar: null,
  };

  useEffect(() => {
    // Initialize with sample faculty data and admin profile
    setFaculty([
      {
        name: "John Doe",
        department: "Computer Science",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        office: "Tech Building, Room 203",
        courses: "CS101, CS202, CS303",
        bio: "Experienced computer science professor with 15 years of teaching experience.",
        avatar: null,
        isActive: true
      }
    ]);
    setUserData(adminData);
    setNotices([
      {
        title: "Welcome to the Dashboard",
        text: "This is a sample notice. In a real application, this would be fetched from the server.",
        date: new Date().toISOString(),
        id: "1"
      }
    ]);

    // Fetch real notices from server
    const fetchNotices = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notices");
        
        if (!response.ok) {
          throw new Error(`Error fetching notices: ${response.status}`);
        }
        
        const noticesData = await response.json();
        console.log("Notices loaded from database:", noticesData);
        setNotices(noticesData);
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };

    // Call fetchNotices when component mounts
    fetchNotices();
  }, []);

  const handleAddSubject = () => {
    if (newSubject.trim() !== "") {
      setSubjects([
        ...subjects,
        {
          name: newSubject,
          info: newSubjectInfo,
          members: 0,
          lastUpdated: new Date().toLocaleDateString(),
          isActive: true,
        },
      ]);
      setNewSubject("");
      setNewSubjectInfo("");
      setShowSubjectModal(false);
    }
  };

  const handleAddFaculty = () => {
    if (newFaculty.trim() !== "") {
      setFaculty([
        ...faculty,
        {
          name: newFaculty,
          department: newFacultyDepartment,
          info: newFacultyInfo,
          lastUpdated: new Date().toLocaleDateString(),
          isActive: true,
        },
      ]);
      setNewFaculty("");
      setNewFacultyInfo("");
      setNewFacultyDepartment("");
      setShowFacultyModal(false);
    }
  };

  const handleAddNotice = async () => {
    if (newNoticeTitle.trim() !== "" && newNotice.trim() !== "") {
      try {
        const noticeData = {
          title: newNoticeTitle,
          content: newNotice,
          audience: ["all"],
          created_by: "Admin User"
        };
        
        console.log("Sending notice data:", noticeData);
        
        const response = await fetch("http://localhost:5000/api/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noticeData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
        
        const savedNotice = await response.json();
        console.log("Notice added successfully:", savedNotice);
        
        // Add the new notice to the state with the proper format
        const newNoticeForState = {
          id: savedNotice.id,
          date: savedNotice.date,
          title: savedNotice.title,
          text: savedNotice.text || newNotice
        };
        
        setNotices([newNoticeForState, ...notices]);
        setNewNoticeTitle("");
        setNewNotice("");
        setShowNoticeModal(false);
        
        // Show success message to user
        alert("Notice added successfully!");
      } catch (err) {
        console.error("Error posting notice:", err);
        alert(`Error posting notice: ${err.message}`);
      }
    }
  };

  const handleRemoveNotice = (index) => {
    const updatedNotices = [...notices];
    updatedNotices.splice(index, 1);
    setNotices(updatedNotices);
  };

  const toggleExpandFaculty = (index) => {
    if (expandedFaculty === index) {
      setExpandedFaculty(null);
    } else {
      setExpandedFaculty(index);
    }
  };

  const toggleExpandSubject = (index) => {
    if (expandedSubject === index) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(index);
    }
  };

  const toggleFacultyStatus = (index, event) => {
    event.stopPropagation();
    const updatedFaculty = [...faculty];
    updatedFaculty[index].isActive = !updatedFaculty[index].isActive;
    setFaculty(updatedFaculty);
  };

  const toggleSubjectStatus = (index, event) => {
    event.stopPropagation();
    const updatedSubjects = [...subjects];
    updatedSubjects[index].isActive = !updatedSubjects[index].isActive;
    setSubjects(updatedSubjects);
  };

  const removeFaculty = (index, event) => {
    event.stopPropagation();
    const updatedFaculty = [...faculty];
    updatedFaculty.splice(index, 1);
    setFaculty(updatedFaculty);

    if (expandedFaculty === index) {
      setExpandedFaculty(null);
    } else if (expandedFaculty !== null && expandedFaculty > index) {
      setExpandedFaculty(expandedFaculty - 1);
    }
  };

  const removeSubject = (index, event) => {
    event.stopPropagation();
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);

    if (expandedSubject === index) {
      setExpandedSubject(null);
    } else if (expandedSubject !== null && expandedSubject > index) {
      setExpandedSubject(expandedSubject - 1);
    }
  };

  const handleSignout = () => {
    setShowSignoutModal(true);
  };

  const confirmSignout = async () => {
    try {
      // In a real app, you would call your authentication service here
      // For example with Supabase:
      // const { error } = await supabase.auth.signOut();
      // if (error) throw error;
      
      localStorage.removeItem('userData');
      window.location.href = '/login';
    } catch (err) {
      console.error('Signout error:', err);
      alert('Error signing out. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="content-header">
          <h2>Admin Dashboard</h2>
          <div className="header-controls">
            {userData && (
              <div 
                className="user-info-compact" 
                onClick={() => setShowProfileModal(true)}
                style={{ cursor: 'pointer' }}
              >
                <div className="profile-info-container">
                  <span className="welcome-text">Welcome, {userData.name || "Admin"}</span>
                  <div className="department-badge">
                    {userData.position || "Position"}
                  </div>
                </div>
                <div className="profile-icon">
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="avatar-mini"
                    />
                  ) : (
                    <div className="avatar-placeholder-mini">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
              </div>
            )}
            <button 
              className="signout-btn" 
              onClick={handleSignout}
            >
              <span className="signout-icon">⏻</span>
              <span className="signout-text">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="content-area">
          <div className="dashboard-layout">
            {/* Left container with featured section, faculty, and subjects */}
            <div className="left-container">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>Welcome, Admin!</h2>
                  <p>Manage faculty, subjects, and more from here.</p>
                  <div className="featured-buttons">
                    <button
                      className="featured-btn"
                      onClick={() => setShowFacultyModal(true)}
                    >
                      + Add Faculty
                    </button>
                    <button
                      className="featured-btn"
                      onClick={() => setShowSubjectModal(true)}
                    >
                      + Add Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* Faculty Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">Faculty Management</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="faculty-container">
                  <div className="faculty-grid">
                    {faculty.length > 0 ? (
                      faculty.map((facultyMember, index) => (
                        <div
                          key={index}
                          className={`faculty-card ${
                            expandedFaculty === index ? "expanded" : ""
                          }`}
                          onClick={() => toggleExpandFaculty(index)}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              height:
                                expandedFaculty === index ? "auto" : "initial",
                            }}
                            className="faculty-content"
                          >
                            <div className="faculty-header">
                              <h3>{facultyMember.name}</h3>
                              <div
                                className={`status-indicator ${
                                  facultyMember.isActive ? "active" : "inactive"
                                }`}
                              ></div>
                            </div>
                            <p className="faculty-department">
                              {facultyMember.department}
                            </p>
                            <p className="faculty-info">{facultyMember.info}</p>

                            <AnimatePresence>
                              {expandedFaculty === index && (
                                <motion.div
                                  className="faculty-details"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Last Updated:
                                    </span>
                                    <span className="detail-value">
                                      {facultyMember.lastUpdated}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Status:</span>
                                    <button
                                      className={`status-badge ${
                                        facultyMember.isActive
                                          ? "active"
                                          : "inactive"
                                      }`}
                                      onClick={(e) =>
                                        toggleFacultyStatus(index, e)
                                      }
                                    >
                                      {facultyMember.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </button>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">
                                      Manage
                                    </button>
                                    <button
                                      className="remove-btn"
                                      onClick={(e) => removeFaculty(index, e)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No faculty added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subjects Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">Subjects</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="subjects-container">
                  <div className="subjects-grid">
                    {subjects.length > 0 ? (
                      subjects.map((subject, index) => (
                        <div
                          key={index}
                          className={`subject-card ${
                            expandedSubject === index ? "expanded" : ""
                          }`}
                          onClick={() => toggleExpandSubject(index)}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              height:
                                expandedSubject === index ? "auto" : "initial",
                            }}
                            className="subject-content"
                          >
                            <div className="subject-header">
                              <h3>{subject.name}</h3>
                              <div
                                className={`status-indicator ${
                                  subject.isActive ? "active" : "inactive"
                                }`}
                              ></div>
                            </div>
                            <p className="subject-info">{subject.info}</p>

                            <AnimatePresence>
                              {expandedSubject === index && (
                                <motion.div
                                  className="subject-details"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Members:
                                    </span>
                                    <span className="detail-value">
                                      {subject.members}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Last Updated:
                                    </span>
                                    <span className="detail-value">
                                      {subject.lastUpdated}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Status:</span>
                                    <button
                                      className={`status-badge ${
                                        subject.isActive ? "active" : "inactive"
                                      }`}
                                      onClick={(e) =>
                                        toggleSubjectStatus(index, e)
                                      }
                                    >
                                      {subject.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">
                                      Manage
                                    </button>
                                    <button
                                      className="remove-btn"
                                      onClick={(e) => removeSubject(index, e)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No subjects added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notices Section - Right side */}
            <div className="right-container">
              <div className="section notices-section">
                <div className="section-header">
                  <h2 className="section-title">Noticeboard</h2>
                  <button 
                    className="featured-btn notice-add-btn"
                    onClick={() => setShowNoticeModal(true)}
                  >
                    + Add Notice
                  </button>
                </div>

                <div className="notice-board">
                  {notices.length > 0 ? (
                    notices.map((notice, index) => (
                      <div key={index} className="notice-item">
                        <div className="notice-header">
                          <div className="notice-date">{new Date(notice.date).toLocaleDateString()}</div>
                          <button 
                            className="notice-remove-btn"
                            onClick={() => handleRemoveNotice(index)}
                          >
                            ✕
                          </button>
                        </div>
                        <h3 className="notice-title">{notice.title}</h3>
                        <p className="notice-text">{notice.text || notice.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No notices added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectModal(false)}
            />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Add New Subject</h2>
              <input
                type="text"
                placeholder="Enter subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="input-field"
                autoFocus
              />
              <input
                type="text"
                placeholder="Brief description about the subject"
                value={newSubjectInfo}
                onChange={(e) => setNewSubjectInfo(e.target.value)}
                className="input-field"
              />
              <div className="button-container">
                <button onClick={handleAddSubject} className="confirm-button">
                  Add
                </button>
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Faculty Modal */}
      <AnimatePresence>
        {showFacultyModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFacultyModal(false)}
            />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Add New Faculty</h2>
              <input
                type="text"
                placeholder="Enter faculty name"
                value={newFaculty}
                onChange={(e) => setNewFaculty(e.target.value)}
                className="input-field"
                autoFocus
              />
              <input
                type="text"
                placeholder="Department"
                value={newFacultyDepartment}
                onChange={(e) => setNewFacultyDepartment(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Brief description or title (optional)"
                value={newFacultyInfo}
                onChange={(e) => setNewFacultyInfo(e.target.value)}
                className="input-field"
              />
              <div className="button-container">
                <button onClick={handleAddFaculty} className="confirm-button">
                  Add Faculty
                </button>
                <button
                  onClick={() => setShowFacultyModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AdminProfile 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialData={adminData}
      />

      {/* Notice Modal */}
      <AnimatePresence>
        {showNoticeModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNoticeModal(false)}
            />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Add New Notice</h2>
              <input
                type="text"
                placeholder="Notice Title"
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
                className="input-field"
                autoFocus
              />
              <textarea
                placeholder="Notice Content"
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                className="input-field notice-textarea"
                rows="4"
              />
              <div className="button-container">
                <button onClick={handleAddNotice} className="confirm-button">
                  Post Notice
                </button>
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Signout Confirmation Modal */}
      <AnimatePresence>
        {showSignoutModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignoutModal(false)}
            />
            <motion.div
              className="modal-container signout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Sign Out</h2>
              <p className="signout-message">Are you sure you want to sign out?</p>
              <div className="button-container">
                <button onClick={confirmSignout} className="confirm-button signout-confirm">
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowSignoutModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;