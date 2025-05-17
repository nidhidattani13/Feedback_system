import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FacultyProfile from "./FacultyProfile";
import * as XLSX from 'xlsx';
import { fetchNotices } from "../../../../Backend/services/noticeService"; // Make sure this path is correct
import supabase from "../../../../Backend/supabaseClient"; // Adjust the import path as necessary

const FacultyDashboard = () => {
  // Existing state variables
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectInfo, setNewSubjectInfo] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newGroupInfo, setNewGroupInfo] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [subjectPlanFile, setSubjectPlanFile] = useState(null);
  const [parsedPlan, setParsedPlan] = useState([]);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  // Update notices state to include proper structure
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Signout function
  const handleSignout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('userData');
      window.location.href = '/login'; // Redirect to login page
    } catch (err) {
      console.error('Signout error:', err);
      alert('Error signing out. Please try again.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Starting to fetch notices...");
        let fetchedNotices = [];

        try {
          fetchedNotices = await fetchNotices("all");
          console.log("Notices fetched successfully:", fetchedNotices);
        } catch (fetchError) {
          console.error("Error fetching notices:", fetchError);
          setError("Failed to load notices.");
        }

        setNotices(fetchedNotices || []);

        // Load user profile (faculty)
        try {
          await fetchFacultyProfile();
        } catch (profileError) {
          console.error("Error loading faculty profile:", profileError);
          setError(prev => prev || "Failed to load profile.");
        }

        // Load subjects from localStorage
        const storedSubjects = localStorage.getItem("subjects");
        if (storedSubjects) {
          setSubjects(JSON.parse(storedSubjects));
        }
      } catch (generalError) {
        console.error("General error loading data:", generalError);
        setError("Failed to load data. Please try again later.");
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchFacultyProfile = async () => {
    try {
      // First check if we're authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      // Get user data from localStorage
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("No user data found");
      }

      const { email } = JSON.parse(userDataString);

      // Try fetching profile from Supabase
      const { data, error } = await supabase
        .from("faculty_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setUserData(data);
      } else {
        // Create default profile if none exists
        const defaultProfile = {
          name: user.user_metadata?.full_name || "Faculty Member",
          title: "Professor",
          department: "",
          email: user.email,
          phone: "",
          office: "",
          officeHours: "",
          researchInterests: "",
          courses: "",
          bio: "",
        };

        // Save default profile to Supabase
        const { error: insertError } = await supabase
          .from("faculty_profiles")
          .insert(defaultProfile);

        if (insertError) {
          throw insertError;
        }

        setUserData(defaultProfile);
      }
    } catch (error) {
      console.error("Error fetching faculty profile:", error);
      throw error;
    }
  };

  const openProfileModal = () => setShowProfileModal(true);
  const closeProfileModal = () => setShowProfileModal(false);

  const handleProfileUpdate = (updatedData) => {
    setUserData(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData));
  };
  
  const handleSubjectPlanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubjectPlanFile(file);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const binaryData = evt.target.result;
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert the worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate data has Week and Topic columns
          if (jsonData.length > 0 && 'Week' in jsonData[0] && 'Topic' in jsonData[0]) {
            setParsedPlan(jsonData);
            setShowPlanPreview(true);
          } else {
            alert("Invalid file format. Please ensure your Excel has 'Week' and 'Topic' columns.");
            setSubjectPlanFile(null);
            setParsedPlan([]);
            setShowPlanPreview(false);
          }
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Error parsing the file. Please make sure it's a valid Excel file.");
          setSubjectPlanFile(null);
          setParsedPlan([]);
          setShowPlanPreview(false);
        }
      };
      reader.onerror = () => {
        alert("Error reading the file");
        setSubjectPlanFile(null);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() !== "") {
      const newSubjectObj = {
        name: newSubject,
        info: newSubjectInfo,
        members: 0,
        lastUpdated: new Date().toLocaleDateString(),
        isActive: true,
        plan: parsedPlan.length > 0 ? parsedPlan : null,
      };
      
      const updatedSubjects = [...subjects, newSubjectObj];
      setSubjects(updatedSubjects);
      
      // Save to localStorage
      localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
      
      // Reset form
      setNewSubject("");
      setNewSubjectInfo("");
      setSubjectPlanFile(null);
      setParsedPlan([]);
      setShowPlanPreview(false);
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

  const toggleSubjectStatus = (index, event) => {
    event.stopPropagation();
    const updatedSubjects = [...subjects];
    updatedSubjects[index].isActive = !updatedSubjects[index].isActive;
    setSubjects(updatedSubjects);
    
    // Update localStorage
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
  };

  const toggleGroupStatus = (index, event) => {
    event.stopPropagation();
    const updatedGroups = [...groups];
    updatedGroups[index].isActive = !updatedGroups[index].isActive;
    setGroups(updatedGroups);
  };

  const removeSubject = (index, event) => {
    event.stopPropagation();
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
    
    // Update localStorage
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));

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

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="content-header">
          <div className="header-controls">
            <button className="control-btn"></button>
            <button className="control-btn"></button>
          </div>

          {userData && (
            <div className="user-info-compact" onClick={openProfileModal}>
              <span>Welcome, {userData.name || "Faculty"}</span>
              <div className="department-badge">
                {userData.department || "Faculty"}
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
        </header>

        <div className="content-area">
          <div className="dashboard-layout">
            {/* Left container with featured section, subjects, and groups */}
            <div className="left-container">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>Manage Your Academic Journey</h2>
                  <p>
                    Add new subjects, create student groups, and engage with
                    your students.
                  </p>
                  <div className="featured-buttons">
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

              {/* Subjects Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">My Subjects</h2>
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
                                    <span className="detail-label">
                                      Status:
                                    </span>
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
                                  {subject.plan && (
                                    <div className="detail-item">
                                      <span className="detail-label">
                                        Academic Plan:
                                      </span>
                                      <span className="detail-value">
                                        {subject.plan.length} weeks
                                      </span>
                                    </div>
                                  )}
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

              {/* Groups Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">My Groups</h2>
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
                                    <span className="detail-label">
                                      Members:
                                    </span>
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
                                    <span className="detail-label">
                                      Status:
                                    </span>
                                    <button
                                      className={`status-badge ${
                                        group.isActive ? "active" : "inactive"
                                      }`}
                                      onClick={(e) =>
                                        toggleGroupStatus(index, e)
                                      }
                                    >
                                      {group.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">
                                      Manage
                                    </button>
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
                  <h2 className="section-title">Notices</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="notice-board">
                  {isLoading ? (
                    <div className="loading-indicator">
                      <p>Loading notices...</p>
                    </div>
                  ) : error ? (
                    <div className="error-message">
                      <p>{error}</p>
                    </div>
                  ) : notices && notices.length > 0 ? (
                    notices.map((notice) => (
                      <div className="notice-item" key={notice.id}>
                        <div className="notice-date">{notice.date}</div>
                        <h3 className="notice-title">{notice.title}</h3>
                        <p className="notice-text">{notice.text}</p>
                        {notice.created_by && (
                          <div className="notice-author">
                            Posted by: {notice.created_by}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No notices available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Include the FacultyProfile component */}
      <FacultyProfile
        isOpen={showProfileModal}
        onClose={closeProfileModal}
        initialData={userData}
        onUpdate={handleProfileUpdate}
      />

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
              
              {/* Academic Plan File Upload */}
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleSubjectPlanUpload}
                    className="file-input"
                  />
                  <div className="custom-file-upload">
                    <span className="upload-icon">📄</span>
                    <span className="upload-text">
                      {subjectPlanFile
                        ? subjectPlanFile.name
                        : "Upload Academic Plan (Excel)"}
                    </span>
                  </div>
                </label>
                {subjectPlanFile && (
                  <div className="file-selected">
                    <div className="file-info">
                      <span className="file-name">{subjectPlanFile.name}</span>
                      <span className="file-size">
                        {(subjectPlanFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <button
                      className="remove-file-btn"
                      onClick={() => {
                        setSubjectPlanFile(null);
                        setParsedPlan([]);
                        setShowPlanPreview(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="file-format-hint">
                  Required format: Excel with columns 'Week' and 'Topic'
                </div>
              </div>
              
              {/* Academic Plan Preview */}
              {showPlanPreview && parsedPlan.length > 0 && (
                <div className="plan-preview-container">
                  <h3 className="preview-heading">Academic Plan Preview</h3>
                  <div className="plan-table-wrapper">
                    <table className="plan-table">
                      <thead>
                        <tr>
                          <th>Week</th>
                          <th>Topic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedPlan.map((week, idx) => (
                          <tr key={idx}>
                            <td>{week.Week}</td>
                            <td>{week.Topic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="button-container">
                <button onClick={handleAddSubject} className="confirm-button">
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowSubjectModal(false);
                    setSubjectPlanFile(null);
                    setParsedPlan([]);
                    setShowPlanPreview(false);
                  }}
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

      <style jsx>
        {`
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
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 20px;
          transition: background-color 0.2s;
        }

        .user-info-compact:hover {
          background-color: #333;
        }

        .department-badge {
          background: #ff4f5a33;
          color: #ff4f5a;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        /* Profile icon styles */
        .profile-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          border: 2px solid #ff4f5a44;
        }

        .avatar-mini {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder-mini {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ff4f5a33 0%, #80002033 100%);
          color: #ff4f5a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
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
          margin-bottom:margin-bottom: 8px;
        }

        .featured-card p {
          font-size: 16px;
          margin-bottom: 12px;
          max-width: 500px;
          opacity: 0.9;
        }

        .featured-btn {
          background-color: rgba(255, 255, 255, 0.2);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .featured-btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }

        /* Section Headers */
        .section {
          margin-bottom: 24px;
          background-color: #222;
          border-radius: 12px;
          padding: 24px;
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
          border: none;
          background: none;
          color: #ff4f5a;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .view-all-btn:hover {
          opacity: 0.8;
        }

        /* Subjects Grid */
        .subjects-grid, .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .subject-card, .group-card {
          background-color: #333;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .subject-card:hover, .group-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .subject-header, .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .subject-header h3, .group-header h3 {
          font-size: 18px;
          font-weight: 500;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .status-indicator.active {
          background-color: #4caf50;
        }

        .status-indicator.inactive {
          background-color: #999;
        }

        .subject-info, .group-info {
          color: #ccc;
          font-size: 14px;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Subject & Group Details */
        .subject-details, .group-details {
          border-top: 1px solid #444;
          padding-top: 16px;
          overflow: hidden;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .detail-label {
          color: #aaa;
          font-size: 14px;
        }

        .detail-value {
          font-size: 14px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          border: none;
          cursor: pointer;
        }

        .status-badge.active {
          background-color: #4caf5033;
          color: #4caf50;
        }

        .status-badge.inactive {
          background-color: #99999933;
          color: #999;
        }

        .button-row {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .manage-btn, .remove-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          border: none;
          cursor: pointer;
          flex: 1;
          transition: background-color 0.2s;
        }

        .manage-btn {
          background-color: #ff4f5a22;
          color: #ff4f5a;
        }

        .manage-btn:hover {
          background-color: #ff4f5a33;
        }

        .remove-btn {
          background-color: #33333333;
          color: #ccc;
        }

        .remove-btn:hover {
          background-color: #44444444;
        }

        /* Notice Board */
        .notices-section {
          height: 100%;
        }

        .notice-board {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notice-item {
          background-color: #333;
          border-radius: 12px;
          padding: 16px;
          border-left: 4px solid #ff4f5a;
        }

        .notice-date {
          color: #aaa;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .notice-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .notice-text {
          color: #ccc;
          font-size: 14px;
        }

        /* Modal */
        .overlay {
          position: fixed;
          top: 
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 100;
          backdrop-filter: blur(5px);
        }

        .modal-container {
          position: fixed;
          top: 80;
          left:450px;
          transform: translate(-50%, -50%);
          background-color: #222;
          border-radius: 16px;
          padding: 24px;
          z-index: 101;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-heading {
          margin-bottom: 16px;
          color: #fff;
          font-size: 20px;
          text-align: center;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #444;
          background-color: #333;
          color: #fff;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .input-field:focus {
          outline: none;
          border-color: #ff4f5a;
        }

        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .confirm-button, .cancel-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .confirm-button {
          background-color: #ff4f5a;
          color: #fff;
        }

        .confirm-button:hover {
          background-color: #e23e49;
        }

        .cancel-button {
          background-color: #444;
          color: #fff;
        }

        .cancel-button:hover {
          background-color: #555;
        }

        /* File Upload */
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
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px dashed #555;
          background-color: #2a2a2a;
          transition: border-color 0.2s, background-color 0.2s;
        }

        .custom-file-upload:hover {
          border-color: #ff4f5a;
          background-color: #2f2f2f;
        }

        .upload-icon {
          font-size: 18px;
        }

        .upload-text {
          color: #ccc;
          font-size: 14px;
        }

        .file-selected {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          margin-top: 8px;
          background-color: #2f2f2f;
          border-radius: 8px;
        }

        .file-info {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-size: 13px;
          color: #fff;
        }

        .file-size {
          font-size: 11px;
          color: #aaa;
          margin-top: 2px;
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 18px;
          transition: color 0.2s;
        }

        .remove-file-btn:hover {
          color: #ff4f5a;
        }

        .file-format-hint {
          font-size: 12px;
          color: #888;
          margin-top: 6px;
          padding-left: 2px;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 150px;
          background-color: #333;
          border-radius: 12px;
          color: #777;
          font-size: 14px;
        }

        /* Plan Preview */
        .plan-preview-container {
          margin-top: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          background-color: #2a2a2a;
          padding: 16px;
          border: 1px solid #444;
        }

        .preview-heading {
          font-size: 16px;
          margin-bottom: 12px;
          color: #ccc;
        }

        .plan-table-wrapper {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 10px;
        }

        .plan-table {
          width: 100%;
          border-collapse: collapse;
        }

        .plan-table th,
        .plan-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #444;
        }

        .plan-table th {
          background-color: #333;
          color: #ccc;
          font-weight: 500;
          position: sticky;
          top: 0;
        }

        .plan-table tbody tr:hover {
          background-color: #333;
        }
      `}
      </style>
    </div>
  );
};

export default FacultyDashboard;