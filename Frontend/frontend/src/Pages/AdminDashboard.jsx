import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectInfo, setNewSubjectInfo] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newGroupInfo, setNewGroupInfo] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  // Faculty Modal States
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyENR, setNewFacultyENR] = useState("");
  const [newFacultySubjects, setNewFacultySubjects] = useState([]);
  const [newFacultySubjectInput, setNewFacultySubjectInput] = useState("");
  const [newFacultyPhoto, setNewFacultyPhoto] = useState(null);

  // Get user data from localStorage on component mount
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const parsedUserData = JSON.parse(userDataString);
      setUserData(parsedUserData);
    }
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

  const handleAddGroup = () => {
    if (newGroup.trim() !== "") {
      setGroups([
        ...groups,
        {
          name: newGroup,
          info: newGroupInfo,
          members: excelFile ? "Pending import" : 0,
          lastUpdated: new Date().toLocaleDateString(),
          isActive: true,
        },
      ]);
      setNewGroup("");
      setNewGroupInfo("");
      setExcelFile(null);
      setShowGroupModal(false);
    }
  };

  const handleAddFaculty = () => {
    if (newFacultyName.trim() !== "" && newFacultyENR.trim() !== "") {
      setFaculty([
        ...faculty,
        {
          name: newFacultyName,
          enr: newFacultyENR,
          subjects: [...newFacultySubjects],
          photo: newFacultyPhoto ? URL.createObjectURL(newFacultyPhoto) : null,
          lastUpdated: new Date().toLocaleDateString(),
          isActive: true,
        },
      ]);
      setNewFacultyName("");
      setNewFacultyENR("");
      setNewFacultySubjects([]);
      setNewFacultySubjectInput("");
      setNewFacultyPhoto(null);
      setShowFacultyModal(false);
    }
  };

  const handleAddFacultySubject = (e) => {
    if (e.key === "Enter" && newFacultySubjectInput.trim() !== "") {
      e.preventDefault();
      if (!newFacultySubjects.includes(newFacultySubjectInput.trim())) {
        setNewFacultySubjects([...newFacultySubjects, newFacultySubjectInput.trim()]);
      }
      setNewFacultySubjectInput("");
    }
  };

  const handleRemoveFacultySubject = (subjectToRemove) => {
    setNewFacultySubjects(newFacultySubjects.filter(subject => subject !== subjectToRemove));
  };

  const handleFacultyPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setNewFacultyPhoto(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const toggleExpandSubject = (index) => {
    if (expandedSubject === index) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(index);
    }
  };

  const toggleExpandGroup = (index) => {
    if (expandedGroup === index) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(index);
    }
  };

  const toggleExpandFaculty = (index) => {
    if (expandedFaculty === index) {
      setExpandedFaculty(null);
    } else {
      setExpandedFaculty(index);
    }
  };

  const toggleSubjectStatus = (index, event) => {
    event.stopPropagation();
    const updatedSubjects = [...subjects];
    updatedSubjects[index].isActive = !updatedSubjects[index].isActive;
    setSubjects(updatedSubjects);
  };

  const toggleGroupStatus = (index, event) => {
    event.stopPropagation();
    const updatedGroups = [...groups];
    updatedGroups[index].isActive = !updatedGroups[index].isActive;
    setGroups(updatedGroups);
  };

  const toggleFacultyStatus = (index, event) => {
    event.stopPropagation();
    const updatedFaculty = [...faculty];
    updatedFaculty[index].isActive = !updatedFaculty[index].isActive;
    setFaculty(updatedFaculty);
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

  const removeGroup = (index, event) => {
    event.stopPropagation();
    const updatedGroups = [...groups];
    updatedGroups.splice(index, 1);
    setGroups(updatedGroups);

    if (expandedGroup === index) {
      setExpandedGroup(null);
    } else if (expandedGroup !== null && expandedGroup > index) {
      setExpandedGroup(expandedGroup - 1);
    }
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

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="content-header">
          <div className="header-controls">
            <button className="control-btn"></button>
            <button className="control-btn"></button>
          </div>

          {userData && (
            <div className="user-info-compact">
              <span>Welcome, {userData.name || "Admin"}</span>
              <div className="department-badge">
                {userData.department || "Administration"}
              </div>
            </div>
          )}
        </header>

        <div className="content-area">
          <div className="dashboard-layout">
            {/* Left container with featured section, subjects, and groups */}
            <div className="left-container">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>Admin Control Center</h2>
                  <p>
                    Manage faculty, subjects, and student groups through this central dashboard.
                  </p>
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
                    <button
                      className="featured-btn"
                      onClick={() => setShowGroupModal(true)}
                    >
                      + Add Group
                    </button>
                  </div>
                </div>
              </div>

              {/* Faculty Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">Faculty</h2>
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
                              <div className="faculty-title-row">
                                {facultyMember.photo && (
                                  <div className="faculty-photo">
                                    <img src={facultyMember.photo} alt={facultyMember.name} />
                                  </div>
                                )}
                                <h3>{facultyMember.name}</h3>
                                <div
                                  className={`status-indicator ${
                                    facultyMember.isActive ? "active" : "inactive"
                                  }`}
                                ></div>
                              </div>
                              <div className="enr-badge">ENR: {facultyMember.enr}</div>
                            </div>
                            
                            <div className="faculty-subjects">
                              {facultyMember.subjects.map((subject, subIdx) => (
                                <span key={subIdx} className="subject-bubble">
                                  {subject}
                                </span>
                              ))}
                            </div>

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
                                        facultyMember.isActive ? "active" : "inactive"
                                      }`}
                                      onClick={(e) => toggleFacultyStatus(index, e)}
                                    >
                                      {facultyMember.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">Manage</button>
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
                                    <span className="detail-label">Members:</span>
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
                                    <button className="manage-btn">Manage</button>
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
              
              {/* Groups Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">Groups</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="groups-container">
                  <div className="groups-grid">
                    {groups.length > 0 ? (
                      groups.map((group, index) => (
                        <div
                          key={index}
                          className={`group-card ${
                            expandedGroup === index ? "expanded" : ""
                          }`}
                          onClick={() => toggleExpandGroup(index)}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              height:
                                expandedGroup === index ? "auto" : "initial",
                            }}
                            className="group-content"
                          >
                            <div className="group-header">
                              <h3>{group.name}</h3>
                              <div
                                className={`status-indicator ${
                                  group.isActive ? "active" : "inactive"
                                }`}
                              ></div>
                            </div>
                            <p className="group-info">{group.info}</p>

                            <AnimatePresence>
                              {expandedGroup === index && (
                                <motion.div
                                  className="group-details"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div className="detail-item">
                                    <span className="detail-label">Members:</span>
                                    <span className="detail-value">
                                      {group.members}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Last Updated:
                                    </span>
                                    <span className="detail-value">
                                      {group.lastUpdated}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Status:</span>
                                    <button
                                      className={`status-badge ${
                                        group.isActive ? "active" : "inactive"
                                      }`}
                                      onClick={(e) => toggleGroupStatus(index, e)}
                                    >
                                      {group.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">Manage</button>
                                    <button
                                      className="remove-btn"
                                      onClick={(e) => removeGroup(index, e)}
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
                        <p>No groups added yet</p>
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
                  <h2 className="section-title">System Notifications</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="notice-board">
                  <div className="notice-item">
                    <div className="notice-date">Mar 22, 2025</div>
                    <h3 className="notice-title">
                      System Update Scheduled
                    </h3>
                    <p className="notice-text">
                      Maintenance update scheduled for March 24th at 2 AM. System will be down for approximately 2 hours.
                    </p>
                  </div>

                  <div className="notice-item">
                    <div className="notice-date">Mar 20, 2025</div>
                    <h3 className="notice-title">User Activity Report</h3>
                    <p className="notice-text">
                      Weekly user activity report is now available. 85% of faculty have logged in this week.
                    </p>
                  </div>

                  <div className="notice-item">
                    <div className="notice-date">Mar 18, 2025</div>
                    <h3 className="notice-title">New Feature Released</h3>
                    <p className="notice-text">
                      Assignment tracking module has been deployed to all faculty accounts.
                    </p>
                  </div>

                  <div className="notice-item">
                    <div className="notice-date">Mar 15, 2025</div>
                    <h3 className="notice-title">Storage Capacity Alert</h3>
                    <p className="notice-text">
                      Storage usage has reached 75% of allocated capacity. Consider archiving old data.
                    </p>
                  </div>
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

      {/* Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGroupModal(false)}
            />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Add New Group</h2>
              <input
                type="text"
                placeholder="Enter group name"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="input-field"
                autoFocus
              />
              <input
                type="text"
                placeholder="Brief description about the group (optional)"
                value={newGroupInfo}
                onChange={(e) => setNewGroupInfo(e.target.value)}
                className="input-field"
              />
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="custom-file-upload">
                    <span className="upload-icon">📄</span>
                    <span className="upload-text">
                      {excelFile
                        ? excelFile.name
                        : "Import student data (Excel)"}
                    </span>
                  </div>
                </label>
                {excelFile && (
                  <div className="file-selected">
                    <div className="file-info">
                      <span className="file-name">{excelFile.name}</span>
                      <span className="file-size">
                        {(excelFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <button
                      className="remove-file-btn"
                      onClick={() => setExcelFile(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="file-format-hint">
                  Required format: Student Name, Enrollment Number
                </div>
              </div>
              <div className="button-container">
                <button onClick={handleAddGroup} className="confirm-button">
                  Add Group
                </button>
                <button
                  onClick={() => setShowGroupModal(false)}
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
              className="modal-container faculty-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Add New Faculty</h2>
              
              <div className="faculty-photo-upload">
                <label className="photo-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFacultyPhotoChange}
                    className="file-input"
                  />
                  <div className="photo-upload-area">
                    {newFacultyPhoto ? (
                      <img 
                        src={URL.createObjectURL(newFacultyPhoto)} 
                        alt="Faculty preview" 
                        className="photo-preview"
                      />
                    ) : (
                      <>
                        <span className="photo-icon">📷</span>
                        <span className="photo-text">Add Photo</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              <input
                type="text"
                placeholder="Enter faculty name"
                value={newFacultyName}
                onChange={(e) => setNewFacultyName(e.target.value)}
                className="input-field"
                autoFocus
              />
              
              <input
                type="text"
                placeholder="Enter faculty ENR"
                value={newFacultyENR}
                onChange={(e) => setNewFacultyENR(e.target.value)}
                className="input-field"
              />
              
              <div className="subjects-input-container">
                <label className="subjects-label">Subjects</label>
                <div className="subjects-input-wrapper">
                  <input
                    type="text"
                    placeholder="Add subjects (press Enter after each)"
                    value={newFacultySubjectInput}
                    onChange={(e) => setNewFacultySubjectInput(e.target.value)}
                    onKeyDown={handleAddFacultySubject}
                    className="input-field subjects-input"
                  />
                  
                  <div className="subjects-bubbles-container">
                    {newFacultySubjects.map((subject, idx) => (
                      <div key={idx} className="subject-bubble">
                        {subject}
                        <button 
                          className="remove-subject-btn"
                          onClick={() => handleRemoveFacultySubject(subject)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
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

      <style jsx>{`
        /* Global styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        /* Dashboard container */
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: #1a1a1a;
          color: #fff;
          overflow-x: hidden;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .content-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
          background-color: #1a1a1a;
          z-index: 10;
        }

        .header-controls {
          display: flex;
          gap: 10px;
        }

        .control-btn {
          width: 30px;
          height: 30px;
          background-color: #333;
          border: none;
          border-radius: 50%;
          color: #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .control-btn:hover {
          background-color: #444;
        }

        .user-info-compact {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .department-badge {
          background: #ff4f5a33;
          color: #ff4f5a;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .content-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          gap: 24px;
          min-height: 100%;
        }

        .left-container {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .right-container {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
        }

        /* Featured Section */
        .featured-card {
          background: linear-gradient(135deg, #ff4f5a 0%, #800020 100%);
          border-radius: 16px;
          padding: 40px;
          color: #fff;
          position: relative;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          align-items: center;
        }

        .featured-content {
          max-width: 100%;
        }

        .featured-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .featured-card h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .featured-card p {
          font-size: 16px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .featured-btn {
          padding: 10px 20px;
          background-color: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .featured-btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        /* Sections */
        .section {
          background: #212121;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
          min-height: 200px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #ff4f5a;
          font-size: 14px;
          cursor: pointer;
        }

        /* Container wrappers */
        .faculty-container,
        .subjects-container,
        .groups-container {
          overflow-y: auto;
          max-height: 500px;
          padding-right: 8px;
          flex: 1;
        }

        /* Faculty Grid */
        .faculty-grid,
        .subjects-grid,
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          padding-bottom: 8px;
        }

        @media (min-width: 1200px) {
          .faculty-grid,
          .subjects-grid,
          .groups-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .faculty-card,
        .subject-card,
        .group-card {
          background: #2a2a2a;
          padding: 16px;
          border-radius: 10px;
          transition: transform 0.2s, background-color 0.2s;
          cursor: pointer;
          overflow: hidden;
        }

        .faculty-card:hover,
        .subject-card:hover,
        .group-card:hover {
          transform: translateY(-3px);
          background-color: #333;
        }

        .faculty-card.expanded,
        .subject-card.expanded,
        .group-card.expanded {
          background-color: #333;
          grid-column: 1 / -1;
        }

        .faculty-content,
        .subject-content,
        .group-content {
          overflow: hidden;
        }

        .faculty-header,
        .subject-header,
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-left: 6px;
        }

        .status-indicator.active {
          background-color: #22c55e;
        }

        .status-indicator.inactive {
          background-color: #ffffff;
        }

        .faculty-card h3,
        .subject-card h3,
        .group-card h3 {
          font-size: 16px;
          font-weight: 500;
        }

        .subject-info,
        .group-info {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .faculty-details,
        .subject-details,
        .group-details {
          margin-top: 16px;
          border-top: 1px solid #444;
          padding-top: 16px;
          overflow: hidden;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .detail-label {
          color: #999;
          font-size: 13px;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 500;
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          border: none;
          cursor: pointer;
        }

        .status-badge.active {
          background: #22c55e;
          color: white;
        }

        .status-badge.inactive {
          background: #ffffff;
          color: #333;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .manage-btn {
          background: #ff4f5a;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
          flex: 1;
        }

        .manage-btn:hover {
          background: #ff3a47;
        }

        .remove-btn {
          background: #444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
          flex: 1;
        }

        .remove-btn:hover {
          background: #666;
        }

        .empty-state {
          grid-column: 1 / -1;
          background-color: #2a2a2a;
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          color: #999;
        }

        /* Notice Board */
        .notices-section {
          height: auto;
          max-height: 100%;
        }

        .notice-board {
          background: #2a2a2a;
          border-radius: 10px;
          max-height: 600px;
          overflow-y: auto;
        }

        .notice-item {
          padding: 20px;
          border-bottom: 1px solid #333;
        }

        .notice-item:last-child {
          border-bottom: none;
        }

        .notice-date {
          font-size: 12px;
          color: #999;
          margin-bottom: 6px;
        }

        .notice-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #ff4f5a;
        }

        .notice-text {
          font-size: 14px;
          color: #ccc;
          line-height: 1.4;
        }

        /* Modal */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index:          z-index: 100;
        }

        .modal-container {
          background: #2a2a2a;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          z-index: 101;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          border: 1px solid #ff4f5a33;
          max-height: 90vh;
          overflow-y: auto;
        }

        .faculty-modal {
          max-width: 550px;
        }

        .modal-heading {
          margin-bottom: 16px;
          text-align: center;
          color: #fff;
          font-size: 18px;
        }

        .input-field {
          width: 100%;
          padding: 12px;
          border: 1px solid #ff4f5a;
          background-color: #333;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #fff;
          transition: border-color 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #ff4f5a;
          box-shadow: 0 0 0 2px #ff4f5a33;
        }

        .input-field::placeholder {
          color: #999;
        }

        .button-container {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .confirm-button {
          flex: 1;
          padding: 12px;
          background: #ff4f5a;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .confirm-button:hover {
          background: #ff3a47;
        }

        .cancel-button {
          flex: 1;
          padding: 12px;
          background: #444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .cancel-button:hover {
          background: #555;
        }

        /* File upload styles */
        .file-upload-container {
          margin-bottom: 16px;
        }

        .file-upload-label {
          cursor: pointer;
          display: block;
        }

        .file-input {
          display: none;
        }

        .custom-file-upload {
          border: 1px dashed #ff4f5a;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          background-color: #333;
          color: #ccc;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .custom-file-upload:hover {
          background-color: #3a3a3a;
          border-color: #ff3a47;
        }

        .upload-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .upload-text {
          font-size: 14px;
        }

        .file-selected {
          margin-top: 12px;
          background: #333;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-info {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-size: 14px;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }

        .file-size {
          font-size: 12px;
          color: #999;
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: #ff4f5a;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .remove-file-btn:hover {
          background-color: #3a3a3a;
        }

        .file-format-hint {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
          text-align: center;
        }

        /* Scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Responsive Media Queries */
        @media (max-width: 1024px) {
          .dashboard-layout {
            flex-direction: column;
          }

          .right-container {
            max-width: 100%;
          }

          .featured-card {
            padding: 30px;
          }

          .featured-card h2 {
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .subjects-grid,
          .groups-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }

          .content-area {
            padding: 16px;
          }

          .featured-card {
            padding: 24px;
          }

          .featured-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .featured-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .subjects-grid,
          .groups-grid {
            grid-template-columns: 1fr;
          }

          .content-area {
            padding: 12px;
          }

          .dashboard-layout {
            gap: 16px;
          }

          .section {
            padding: 16px;
          }

          .featured-card h2 {
            font-size: 20px;
          }

          .featured-card {
            padding: 20px;
          }

          .button-container {
            flex-direction: column;
          }
        }

        /* Loading animations */
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }

        .loading {
          animation: pulse 1.5s infinite ease-in-out;
        }

        /* Tooltip styles */
        .tooltip {
          position: relative;
          display: inline-block;
        }

        .tooltip .tooltip-text {
          visibility: hidden;
          background-color: #444;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 6px 12px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
          white-space: nowrap;
        }

        .tooltip .tooltip-text::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #444 transparent transparent transparent;
        }

        .tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        /* Badge styles */
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-primary {
          background-color: #ff4f5a33;
          color: #ff4f5a;
        }

        .badge-success {
          background-color: #22c55e33;
          color: #22c55e;
        }

        .badge-warning {
          background-color: #f59e0b33;
          color: #f59e0b;
        }

        /* Empty state animations */
        .empty-state {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card hover effects */
        .subject-card,
        .group-card {
          position: relative;
          overflow: hidden;
        }

        .subject-card::after,
        .group-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(255, 79, 90, 0.1) 100%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .subject-card:hover::after,
        .group-card:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;