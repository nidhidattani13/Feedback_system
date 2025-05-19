import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNotices } from "../../../../Backend/services/noticeService";
import StudentProfile from "./StudentProfile"; // Import the StudentProfile component


const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);
  const [userData, setUserData] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mock data for initial setup
  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const parsedUserData = JSON.parse(userDataString);
      setUserData(parsedUserData);
    } else {
      // Sample user data if none exists
      const sampleUserData = {
        name: "Alex Johnson",
        program: "Computer Science",
        semester: "4th Semester",
        email: "alex.johnson@example.com"
      };
      localStorage.setItem("userData", JSON.stringify(sampleUserData));
      setUserData(sampleUserData);
    }

    // Mock subject data
    const initialSubjects = [
      {
        id: 1,
        name: "Introduction to Computer Science",
        faculty: "Dr. John Smith",
        info: "Fundamental concepts of computer science and programming",
        lastUpdated: "Apr 10, 2025",
        progress: 75,
        assignments: 3,
        isActive: true,
      },
      {
        id: 2,
        name: "Calculus II",
        faculty: "Prof. Jane Doe",
        info: "Advanced concepts in integration and differentiation",
        lastUpdated: "Apr 12, 2025",
        progress: 60,
        assignments: 2,
        isActive: true,
      },
      {
        id: 3,
        name: "Data Structures",
        faculty: "Dr. Robert Johnson",
        info: "Implementation and analysis of data structures",
        lastUpdated: "Apr 15, 2025",
        progress: 40,
        assignments: 1,
        isActive: true,
      },
    ];
    setSubjects(initialSubjects);

    // Mock notice data
    const initialNotices = [
      {
        id: 1,
        title: "Midterm Exams Schedule",
        date: "Apr 15, 2025",
        content: "Midterm exams will be held from April 25th to May 5th. Please check the schedule on the university portal.",
        isRead: false,
      },
      {
        id: 2,
        title: "Registration for Next Semester",
        date: "Apr 12, 2025",
        content: "Registration for next semester courses will begin on April 20th. Please consult with your academic advisor before registering.",
        isRead: false,
      },
      {
        id: 3,
        title: "Campus Career Fair",
        date: "Apr 10, 2025",
        content: "The annual campus career fair will be held on April 22nd from 10 AM to 4 PM in the Student Union Building.",
        isRead: true,
      },
      {
        id: 4,
        title: "Library Hours Extended",
        date: "Apr 8, 2025",
        content: "The university library will have extended hours during the exam period, staying open until midnight from April 20th to May 10th.",
        isRead: true,
      },
    ];

    // Check localStorage for previously saved notices
    const savedNotices = localStorage.getItem("studentNotices");
    if (savedNotices) {
      setNotices(JSON.parse(savedNotices));
    } else {
      setNotices(initialNotices);
      localStorage.setItem("studentNotices", JSON.stringify(initialNotices));
    }

    // Check localStorage for previously saved reviews
    const savedReviews = localStorage.getItem("studentReviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      localStorage.setItem("studentReviews", JSON.stringify([]));
    }
  }, []);

  // Save notices to localStorage when they change
  useEffect(() => {
    if (notices.length > 0) {
      localStorage.setItem("studentNotices", JSON.stringify(notices));
    }
  }, [notices]);

  // Save reviews to localStorage when they change
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem("studentReviews", JSON.stringify(reviews));
    }
  }, [reviews]);

  const toggleExpandSubject = (index) => {
    if (expandedSubject === index) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(index);
    }
  };

  const markNoticeAsRead = (id) => {
    const updatedNotices = notices.map((notice) =>
      notice.id === id ? { ...notice, isRead: true } : notice
    );
    setNotices(updatedNotices);
  };

  const handleReviewSubmit = () => {
    if (selectedSubject && reviewText.trim()) {
      setSubmitLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const subjectObj = subjects.find(sub => sub.id === parseInt(selectedSubject));
        const newReview = {
          id: Date.now(),
          subjectId: parseInt(selectedSubject),
          subjectName: subjectObj.name,
          faculty: subjectObj.faculty,
          reviewText: reviewText,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
        
        setReviews([newReview, ...reviews]);
        setReviewText("");
        setSelectedSubject("");
        setShowReviewModal(false);
        setSubmitLoading(false);
      }, 1000);
    }
  };

  const unreadNoticesCount = notices.filter(notice => !notice.isRead).length;

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="content-header">
          <h2>Student Portal</h2>
          <div className="header-controls">
            {userData && (
              <div className="header-controls">
  {userData && (
    <>
      <div className="user-info-compact" onClick={() => setShowProfileModal(true)}>
        <span>Welcome, {userData.name || "Student"}</span>
        <div className="department-badge">
          {userData.program || "Student"}
        </div>
        <div className="profile-icon">
          {userData.name ? userData.name.charAt(0).toUpperCase() : "S"}
        </div>
        {/* Profile Modal */}
<StudentProfile 
  isOpen={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  initialData={userData}
/>
      </div>
    </>
  )}
</div>
            )}
          </div>
        </header>

        <div className="content-area">
          <div className="dashboard-layout">
            {/* Left container with featured section and subjects */}
            <div className="left-container">
              <div className="featured-card">
                <div className="featured-content">
                  <h2>Your Academic Journey</h2>
                  <p>
                    Track your courses, stay updated with notices, and share your feedback.
                  </p>
                  <div className="featured-buttons">
                    <button
                      className="featured-btn"
                      onClick={() => setShowReviewModal(true)}
                    >
                      + Write Review
                    </button>
                    {unreadNoticesCount > 0 && (
                      <button className="featured-btn">
                        {unreadNoticesCount} Unread Notice{unreadNoticesCount !== 1 ? 's' : ''}
                      </button>
                    )}
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
                            <p className="faculty-name">{subject.faculty}</p>
                            <p className="subject-info">{subject.info}</p>

                            <div className="progress-container">
                              <div className="progress-label">
                                <span>Progress</span>
                                <span>{subject.progress}%</span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${subject.progress}%` }}
                                ></div>
                              </div>
                            </div>

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
                                      Faculty:
                                    </span>
                                    <span className="detail-value">
                                      {subject.faculty}
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
                                      Pending Assignments:
                                    </span>
                                    <span className="detail-value">
                                      {subject.assignments}
                                    </span>
                                  </div>
                                  <div className="button-row">
                                    <button className="manage-btn">
                                      Go to Subject
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
                        <p>No subjects enrolled yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">My Reviews</h2>
                  <button className="view-all-btn" onClick={() => setShowReviewModal(true)}>+ Add Review</button>
                </div>

                <div className="reviews-container">
                  {reviews.length > 0 ? (
                    <div className="reviews-list">
                      {reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <h3 className="review-subject">{review.subjectName}</h3>
                            <div className="review-date">{review.date}</div>
                          </div>
                          <div className="review-faculty">Faculty: {review.faculty}</div>
                          <p className="review-text">{review.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No reviews submitted yet</p>
                      <button 
                        className="empty-action-btn"
                        onClick={() => setShowReviewModal(true)}
                      >
                        Write Your First Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notices Section - Right side */}
            <div className="right-container">
              <div className="section notices-section">
                <div className="section-header">
                  <h2 className="section-title">Notices</h2>
                  {unreadNoticesCount > 0 && (
                    <div className="badge badge-primary">{unreadNoticesCount} New</div>
                  )}
                </div>

                <div className="notice-board">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div 
                        className={`notice-item ${notice.isRead ? 'read' : 'unread'}`} 
                        key={notice.id}
                      >
                        <div className="notice-date">{notice.date}</div>
                        <div className="notice-header">
                          <h3 className="notice-title">{notice.title}</h3>
                          {!notice.isRead && (
                            <span className="unread-indicator"></span>
                          )}
                        </div>
                        <p className="notice-text">{notice.content}</p>
                        {!notice.isRead && (
                          <button 
                            className="mark-read-btn"
                            onClick={() => markNoticeAsRead(notice.id)}
                          >
                            Mark as Read
                          </button>
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

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
            />
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="modal-heading">Submit Review</h2>
              <div className="select-wrapper">
                <select
                  className="select-field"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} - {subject.faculty}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Share your thoughts about this subject and faculty..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="textarea-field"
                rows="5"
                required
              />
              <div className="button-container">
                <button 
                  onClick={handleReviewSubmit} 
                  className="confirm-button"
                  disabled={!selectedSubject || !reviewText.trim() || submitLoading}
                >
                  {submitLoading ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
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
          align-items: center;
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

        /* Badge */
        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-primary {
          background-color: #ff4f5a;
          color: white;
        }

        /* Container wrappers */
        .subjects-container,
        .reviews-container {
          overflow-y: auto;
          max-height: 500px;
          padding-right: 8px;
          flex: 1;
        }

        /* Subjects Grid */
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding-bottom: 8px;
        }

        @media (min-width: 1200px) {
          .subjects-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .subject-card {
          background: #2a2a2a;
          padding: 16px;
          border-radius: 10px;
          transition: transform 0.2s, background-color 0.2s;
          cursor: pointer;
          overflow: hidden;
        }

        .subject-card:hover {
          transform: translateY(-3px);
          background-color: #333;
        }

        .subject-card.expanded {
          background-color: #333;
          grid-column: 1 / -1;
        }

        .subject-content {
          overflow: hidden;
        }

        .subject-header {
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

        .subject-card h3 {
          font-size: 16px;
          font-weight: 500;
        }

        .faculty-name {
          font-size: 13px;
          color: #ff4f5a;
          margin-bottom: 6px;
        }

        .subject-info {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Progress bar styles */
        .progress-container {
          margin-top: 8px;
          margin-bottom: 6px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #ccc;
          margin-bottom: 4px;
        }

        .progress-bar {
          height: 6px;
          background-color: #333;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #ff4f5a;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .subject-details,
        .review-details {
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

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #2a2a2a;
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          color: #999;
          gap: 16px;
        }

        .empty-action-btn {
          background: #ff4f5a;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
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
          position: relative;
        }

        .notice-item.unread {
          background-color: #2d2d2d;
        }

        .notice-item.read {
          opacity: 0.8;
        }

        .notice-item:last-child {
          border-bottom: none;
        }

        .notice-date {
          font-size: 12px;
          color: #999;
          margin-bottom: 6px;
        }

        .notice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .notice-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #ff4f5a;
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          background-color: #ff4f5a;
          border-radius: 50%;
          display: inline-block;
        }

        .notice-text {
          font-size: 14px;
          color: #ccc;
          line-height: 1.4;
        }

        .mark-read-btn {
          background: none;
          border: 1px solid #ff4f5a;
          color: #ff4f5a;
          padding: 4px 10px;
          border-radius: 4px;
          margin-top: 12px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .mark-read-btn:hover {
          background: #ff4f5a33;
        }

        /* Review List */
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-item {
          background: #2a2a2a;
          padding: 16px;
          border-radius: 10px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .review-subject {
          font-size: 16px;
          font-weight: 500;
          color: #ff4f5a;
        }

        .review-date {
          font-size: 12px;
          color: #999;
        }

        .review-faculty {
          font-size: 13px;
          color: #ccc;
          margin-bottom: 8px;
        }

        .review-text {
          font-size: 14px;
          color: #eee;
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
          z-index: 100;
        }

        .modal-container {
          background: #2a2a2a;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          z-index: 101;
          position: fixed;
          top: 30%;
          left: 34%;
          transform: translate(-50%, -50%);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          border: 1px solid #ff4f5a33;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-heading {
          margin-bottom: 16px;
          text-align: center;
          color: #fff;
          font-size: 20px;
        }

        .select-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .select-field {
          width: 100%;
          padding: 12px;
          border: 1px solid #ff4f5a;
          background-color: #333;
          border-radius: 8px;
          font-size: 14px;
          color: #fff;
          appearance: none;
          cursor: pointer;
        }

        .select-field:focus {
          outline: none;
          border-color: #ff4f5a;
          box-shadow: 0 0 0 2px #ff4f5a33;
        }

        .select-wrapper::after {
          content: "▼";
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #ccc;
          pointer-events: none;
          font-size: 12px;
        }

        .textarea-field {
          width:.textarea-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #444;
  background-color: #333;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 16px;
}

.textarea-field:focus {
  outline: none;
  border-color: #ff4f5a;
  box-shadow: 0 0 0 2px #ff4f5a33;
}

.button-container {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-button {
  background: #ff4f5a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.confirm-button:hover {
  background: #ff3a47;
}

.confirm-button:disabled {
  background: #666;
  cursor: not-allowed;
}

.cancel-button {
  background: none;
  border: 1px solid #666;
  color: #ccc;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #333;
  border-color: #999;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .right-container {
    max-width: 100%;
  }
  
  .subjects-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .featured-card {
    padding: 24px;
  }
  
  .section {
    padding: 16px;
  }
  
  .content-area {
    padding: 16px;
  }
  
  .notice-board {
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  
  .featured-buttons {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .featured-btn {
    width: 100%;
  }
  
  .button-container {
    flex-direction: column;
  }
  
  .confirm-button, .cancel-button {
    width: 100%;
  }
  
  .modal-container {
    width: 90%;
    padding: 16px;
  }
}
      `}</style>
    </div>
  );
};

export default StudentDashboard;