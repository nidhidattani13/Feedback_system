import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div style={{
            width: "200px",
            height: "100vh",
            background: "#222",
            color: "#fff",
            padding: "20px",
            display: "flex",
            flexDirection: "column"
        }}>
            <h2 style={{ textAlign: "center" }}>Menu</h2>
            <Link to="/" style={{ color: "#fff", textDecoration: "none", marginBottom: "10px" }}>Home</Link>
            <Link to="/student-dashboard" style={{ color: "#fff", textDecoration: "none", marginBottom: "10px" }}>Student Dashboard</Link>
            <Link to="/faculty-dashboard" style={{ color: "#fff", textDecoration: "none", marginBottom: "10px" }}>Faculty Dashboard</Link>
            <Link to="/admin-dashboard" style={{ color: "#fff", textDecoration: "none", marginBottom: "10px" }}>Admin Dashboard</Link>
            <Link to="/report" style={{ color: "#fff", textDecoration: "none" }}>Reports</Link>
        </div>
    );
}
