import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px", // Slightly wider for better spacing
        height: "100vh",
        background: "#222",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Menu</h2>
      {/* {[
        { to: "/", label: "Home" },
        { to: "/feedback-system/student-dashboard", label: "Student Dashboard" },
        { to: "/feedback-system/faculty-dashboard", label: "Faculty Dashboard" },
        { to: "/feedback-system/admin-dashboard", label: "Admin Dashboard" },
        { to: "/feedback-system/report", label: "Reports" },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            color: "#fff",
            textDecoration: "none",
            padding: "10px",
            display: "block",
            borderRadius: "5px",
            transition: "background 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#444")}
          onMouseLeave={(e) => (e.target.style.background = "transparent")}
        >
          {item.label}
        </Link>
      ))} */}
    </div>
  );
}
