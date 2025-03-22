import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Sign in to your Account</h2>
        <input type="text" placeholder="Enrollment Number" style={inputStyle} />
        <input type="password" placeholder="Password" style={inputStyle} />
        <p style={forgotPasswordStyle}>Forgot password?</p>
        <button style={buttonStyle}>Continue</button>
        <p style={linkStyle} onClick={() => navigate("/signup")}>
          Create New Account
        </p>
      </div>
    </div>
  );
};
const handleLogin = async (e) => {
  e.preventDefault();
  const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollment, password }),
  });

  const data = await response.json();
  if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Login Successful!");
  } else {
      alert(data.message);
  }
};

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#F2F1EF",
};

const boxStyle = {
  width: "100%",
  maxWidth: "400px",
  padding: "24px",
  borderRadius: "16px",
  backgroundColor: "white",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333",
};

const inputStyle = {
  width: "calc(100% - 24px)",
  padding: "12px",
  margin: "12px 0",
  borderRadius: "8px",
  border: "1px solid #ddd",
  backgroundColor: "#f8f8f8",
  fontSize: "14px",
  boxSizing: "border-box",
};

const forgotPasswordStyle = {
  fontSize: "14px",
  color: "red",
  cursor: "pointer",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#FF4F5A",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
};

const linkStyle = {
  fontSize: "14px",
  marginTop: "16px",
  color: "#555",
  cursor: "pointer",
};

export default LoginPage;
