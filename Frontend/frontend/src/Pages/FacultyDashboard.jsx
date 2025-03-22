import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeIntroduction from "./WelcomeIntroduction";

const FacultyDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userData, setUserData] = useState(null);

  // Check local storage for returning users
  useEffect(() => {
    const savedUserData = localStorage.getItem('facultyDashboardUser');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
      setShowWelcome(false);
    }
  }, []);

  const handleAddSubject = () => {
    if (newSubject.trim() !== "") {
      setSubjects([...subjects, { name: newSubject, members: 0 }]);
      setNewSubject("");
      setShowModal(false);
    }
  };

  const handleWelcomeComplete = (data) => {
    setUserData(data);
    setShowWelcome(false);
    // Save to local storage for returning users
    localStorage.setItem('facultyDashboardUser', JSON.stringify(data));
  };

  return (
    <div className="dashboard-container">
      <AnimatePresence>
        {showWelcome && (
          <WelcomeIntroduction onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <header className="dashboard-header">
            <div className="logo">Faculty Dashboard</div>
            {userData && (
              <div className="user-info">
                <span>Welcome, {userData.name}</span>
                <div className="department-badge">{userData.department}</div>
              </div>
            )}
          </header>

          <div className="dashboard-content">
            <div className="left-container">
              <h2 className="heading">Manage Subjects & Classes</h2>
              <p className="description">
                Add new subjects and assign classes to them.
              </p>
              <button className="add-button" onClick={() => setShowModal(true)}>
                + Add Subject
              </button>
              <div className="subjects-container">
                {subjects.length > 0 ? (
                  subjects.map((subject, index) => (
                    <div key={index} className="subject-card">
                      <h3>{subject.name}</h3>
                      <p>Members: {subject.members}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-subjects">No subjects added yet</p>
                )}
              </div>
            </div>

            <div className="right-container">
              <h2 className="heading">Notice Board</h2>
              <div className="notice-board">
                <p>No new notices available.</p>
              </div>
            </div>
          </div>
        </>
      )}

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
        }
        
        /* Dashboard container */
        .dashboard-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;
          background-color: #f0f2f5;
        }
        
        /* Header */
        .dashboard-header {
          background: #fff;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          z-index: 10;
        }
        
        .logo {
          font-size: 1.4rem;
          font-weight: bold;
          color: #FF4F5A;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .department-badge {
          background: #FFF0F1;
          color: #FF4F5A;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        /* Dashboard content */
        .dashboard-content {
          display: flex;
          flex: 1;
          gap: 1rem;
          height: calc(100% - 60px);
          max-height: calc(100% - 60px);
          padding: 1rem;
        }
        
        /* Containers */
        .left-container {
          flex: 3;
          background: #fff;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .right-container {
          flex: 1;
          background: #fff;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        /* Typography */
        .heading {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .description {
          font-size: 1rem;
          color: #666;
          margin-bottom: 1rem;
        }
        
        /* Button styling */
        .add-button {
          padding: 0.6rem 1.2rem;
          background-color: #FF4F5A;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          align-self: flex-start;
          transition: background-color 0.2s;
        }
        
        .add-button:hover {
          background-color: #ff3a47;
        }
        
        /* Subjects container */
        .subjects-container {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          overflow-y: auto;
          padding-right: 0.5rem;
          flex: 1;
        }
        
        .no-subjects {
          color: #888;
          width: 100%;
          text-align: center;
          margin-top: 2rem;
        }
        
        .subject-card {
          background: #F2F2F7;
          padding: 1rem;
          border-radius: 5px;
          width: calc(33.333% - 0.6rem);
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        
        .subject-card:hover {
          transform: translateY(-2px);
        }
        
        .subject-card h3 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        
        /* Notice Board */
        .notice-board {
          background: #F2F2F7;
          padding: 1rem;
          border-radius: 5px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          margin-top: 1rem;
        }
        
        /* Modal */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .modal-container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          z-index: 101;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .modal-heading {
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .input-field {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 0.8rem;
        }
        
        .confirm-button, .cancel-button {
          padding: 0.6rem 1.2rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .confirm-button {
          background-color: #FF4F5A;
          color: white;
        }
        
        .confirm-button:hover {
          background-color: #ff3a47;
        }
        
        .cancel-button {
          background-color: #f2f2f2;
          color: #333;
        }
        
        .cancel-button:hover {
          background-color: #e5e5e5;
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
          .dashboard-content {
            flex-direction: column;
          }
          
          .left-container, .right-container {
            height: auto;
          }
          
          .subject-card {
            width: calc(50% - 0.4rem);
          }
        }
        
        @media (max-width: 480px) {
          .user-info {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.3rem;
          }
          
          .subject-card {
            width: 100%;
          }
          
          .button-container {
            flex-direction: column;
          }
          
          .confirm-button, .cancel-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;