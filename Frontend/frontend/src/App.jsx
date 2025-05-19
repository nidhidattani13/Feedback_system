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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Pages Wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* <Route path="/report" element={<ReportView />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}
