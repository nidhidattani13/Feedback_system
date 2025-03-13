import React from "react";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import StudentDashboard from "./Pages/Studentdashboard.jsx";
import FacultyDashboard from "./Pages/Facultdashboard.jsx";
import AdminDashboard from "./Pages/Admin.jsx";
import ReportView from "./Pages/Reportview.jsx";

export default function App() {
    return (
        <Router>
            <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flex: 1 }}>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/student-dashboard" element={<StudentDashboard />} />
                        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/report" element={<ReportView />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}
