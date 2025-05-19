import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import StudentDashboard from "./Pages/Studentdashboard.jsx";
import FacultyDashboard from "./Pages/FacultyDashboard.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
// import ReportView from "./Pages/ReportView.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Layout from "./components/Layout.jsx"; // Move Layout into its own file
import "./styles/Global.css"; // This should import Tailwind
import "./styles/Theme.css"; // Your custom theme

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/feedback-system/login" element={<Login />} />
        <Route path="/feedback-system/signup" element={<Signup />} />
        <Route path="/feedback-system/" element={<Login />} />

        {/* Dashboard Pages Wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/feedback-system/home" element={<Home />} />
          <Route path="/feedback-system/student-dashboard" element={<StudentDashboard />} />
          <Route path="/feedback-system/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/feedback-system/admin-dashboard" element={<AdminDashboard />} />
          {/* <Route path="/feedback-system/report" element={<ReportView />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}
