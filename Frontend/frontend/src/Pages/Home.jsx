import React from "react";

const Home = () => {
  return (
    <div style={containerStyle}>
      <div style={dashboardStyle}>
        {/* Noticeboard Bubble */}
        <div style={noticeBoardStyle}>
          
          <h3 style={noticeTitleStyle}>Notice Board</h3>
          <p style={noticeTextStyle}>Latest updates from the admin...</p>
        </div>

        {/* Modules Section */}
        <div style={modulesContainer}>
          <div style={moduleStyle}>Faculty & Subject Rating</div>
          <div style={moduleStyle}>Planning Module</div>
          <div style={moduleStyle}>Noticeboard Module</div>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  background: "linear-gradient(to bottom, #E3F2FD, #ffffff)",
  padding: "20px",
  boxSizing: "border-box",
};

const dashboardStyle = {
  width: "90%",
  maxWidth: "1200px",
  padding: "24px",
  borderRadius: "20px",
  backgroundColor: "white",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  textAlign: "center",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "85vh",
};

const noticeBoardStyle = {
  position: "absolute",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "white",
  padding: "16px 20px",
  borderRadius: "20px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
  minWidth: "280px",
  textAlign: "center",
  maxWidth: "95%",
  boxSizing: "border-box",
};

const noticeTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold",
};

const noticeTextStyle = {
  fontSize: "14px",
  color: "#555",
};

const modulesContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "80px",
  gap: "24px",
  width: "100%",
};

const moduleStyle = {
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: "#FAFAFA",
  boxShadow: "0 5px 12px rgba(0, 0, 0, 0.1)",
  fontSize: "18px",
  fontWeight: "600",
  textAlign: "center",
  transition: "all 0.3s ease",
  cursor: "pointer",
};

moduleStyle[":hover"] = {
  backgroundColor: "#E3F2FD",
  transform: "translateY(-5px)",
};

export default Home;
