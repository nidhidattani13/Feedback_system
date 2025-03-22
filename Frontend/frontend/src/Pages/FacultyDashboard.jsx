import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FacultyDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);

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
      setSubjects([...subjects, { name: newSubject, members: 0 }]);
      setNewSubject("");
      setShowModal(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <div className="header-controls">
            <button className="control-btn">◀</button>
            <button className="control-btn">▶</button>
          </div>

          {userData && (
            <div className="user-info-compact">
              <span>Welcome, {userData.name || "Faculty"}</span>
              <div className="department-badge">
                {userData.department || "Faculty"}
              </div>
            </div>
          )}
        </header>

        <div className="content-area">
          <div className="dashboard-layout">
            {/* Featured Section - Now covers more space */}
            <div className="left-container">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>Manage Your Academic Journey</h2>
                  <p>
                    Add new subjects, track progress, and engage with your students.
                  </p>
                  <button
                    className="featured-btn"
                    onClick={() => setShowModal(true)}
                  >
                    + Add Subject
                  </button>
                </div>
              </div>

              {/* Subjects Grid */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">My Subjects</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="subjects-grid">
                  {subjects.length > 0 ? (
                    subjects.map((subject, index) => (
                      <div key={index} className="subject-card">
                        <h3>{subject.name}</h3>
                        <p>Members: {subject.members}</p>
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

            {/* Notices Section - Now on the right side */}
            <div className="right-container">
              <div className="section notices-section">
                <div className="section-header">
                  <h2 className="section-title">Notices</h2>
                  <button className="view-all-btn">View All</button>
                </div>

                <div className="notice-board">
                  <div className="notice-item">
                    <div className="notice-date">Mar 22, 2025</div>
                    <h3 className="notice-title">End of Semester Approaching</h3>
                    <p className="notice-text">
                      Please submit all final grades by April 10th. Contact the registrar's office if you need assistance.
                    </p>
                  </div>
                  
                  <div className="notice-item">
                    <div className="notice-date">Mar 20, 2025</div>
                    <h3 className="notice-title">Faculty Meeting</h3>
                    <p className="notice-text">
                      Reminder: Department meeting scheduled for March 25th at 2:00 PM in Conference Room B.
                    </p>
                  </div>
                  
                  <div className="notice-item">
                    <div className="notice-date">Mar 18, 2025</div>
                    <h3 className="notice-title">System Maintenance</h3>
                    <p className="notice-text">
                      The faculty portal will be unavailable on Saturday from 2 AM to 5 AM due to scheduled maintenance.
                    </p>
                  </div>
                  
                  <div className="notice-item">
                    <div className="notice-date">Mar 15, 2025</div>
                    <h3 className="notice-title">Research Grant Opportunity</h3>
                    <p className="notice-text">
                      New research grants available. Applications due by April 15th. See Research Office for details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Centered and with transparent background */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
              <div className="button-container">
                <button onClick={handleAddSubject} className="confirm-button">
                  Add
                </button>
                <button
                  onClick={() => setShowModal(false)}
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
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: #1a1a1a;
          color: #fff;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          width: 100%;
        }

        .content-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
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
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: flex;
          gap: 24px;
          height: 100%;
          overflow: hidden;
        }

        .left-container {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow: hidden;
        }

        .right-container {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
          overflow: hidden;
        }

        /* Featured Section */
        .featured-card {
          background: linear-gradient(135deg, #ff4f5a 0%, #800020 100%);
          border-radius: 16px;
          padding: 40px;
          color: #fff;
          position: relative;
          overflow: hidden;
          height: 200px;
          display: flex;
          align-items: center;
        }

        .featured-content {
          max-width: 80%;
        }

        .featured-card h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .featured-card p {
          font-size: 16px;
          margin-bottom: 24px;
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
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1;
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

        /* Subjects Grid */
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          overflow-y: auto;
          max-height: calc(100% - 40px);
          padding-right: 8px;
        }

        .subject-card {
          background: #2a2a2a;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          transition: transform 0.2s, background-color 0.2s;
        }

        .subject-card:hover {
          transform: translateY(-3px);
          background-color: #333;
        }

        .subject-card h3 {
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 500;
        }

        .subject-card p {
          font-size: 14px;
          color: #999;
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
          height: 100%;
          overflow: hidden;
        }

        .notice-board {
          background: #2a2a2a;
          border-radius: 10px;
          height: calc(100% - 40px);
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
          left: 0px;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-container {
          background: #2a2a2a;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          z-index: 101;
          position: fixed;
          top: 35%;
          left: 35%;
          // transform: translate(-50%, -50%);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          border: 1px solid #ff4f5a33;
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
          justify-content: flex-end;
          gap: 12px;
        }

        .confirm-button,
        .cancel-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .confirm-button {
          background-color: #ff4f5a;
          color: white;
        }

        .confirm-button:hover {
          background-color: #ff3a47;
        }

        .cancel-button {
          background-color: #444;
          color: #fff;
        }

        .cancel-button:hover {
          background-color: #555;
        }

        /* Scrollbar styling */
        .subjects-grid::-webkit-scrollbar,
        .notice-board::-webkit-scrollbar {
          width: 6px;
        }

        .subjects-grid::-webkit-scrollbar-track,
        .notice-board::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }

        .subjects-grid::-webkit-scrollbar-thumb,
        .notice-board::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 10px;
        }

        .subjects-grid::-webkit-scrollbar-thumb:hover,
        .notice-board::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Media Queries */
        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
          }

          .right-container {
            max-width: 100%;
          }

          .featured-content {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .featured-card {
            padding: 24px;
          }

          .featured-card h2 {
            font-size: 24px;
          }

          .subjects-grid {
            grid-template-columns: 1fr;
          }

          .button-container {
            flex-direction: column;
          }

          .confirm-button,
          .cancel-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;