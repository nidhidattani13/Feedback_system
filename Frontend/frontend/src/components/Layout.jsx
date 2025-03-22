import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const Layout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* <Sidebar /> */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* <Navbar /> */}
        <div style={{ flex: 1, background: "#f5f5f5" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
