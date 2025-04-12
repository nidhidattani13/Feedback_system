import React from "react";

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome to your student dashboard. Your content will appear here.</p>
      
      <style jsx>{`
        .student-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          color: #ff4f5a;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;