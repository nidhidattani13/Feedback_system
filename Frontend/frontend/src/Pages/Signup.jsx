import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../Backend/supabaseClient"; // Adjust path as needed


const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation Logic
  const validate = (field, value) => {
    let validationErrors = { ...errors };

    if (field === "name" && !/^[A-Za-z ]+$/.test(value)) {
      validationErrors.name = "Name should only contain alphabets.";
    } else {
      delete validationErrors.name;
    }

    if (field === "enrollment" && !/^[0-9]{11}$/.test(value)) {
      validationErrors.enrollment =
        "Enrollment number must be exactly 11 digits.";
    } else {
      delete validationErrors.enrollment;
    }

    if (field === "password") {
      let passwordErrors = [];
      if (value.length < 11)
        passwordErrors.push("Password must be at least 11 characters.");
      if (!/[A-Z]/.test(value))
        passwordErrors.push("Must contain at least 1 uppercase letter.");
      if (!/[0-9]/.test(value))
        passwordErrors.push("Must contain at least 1 number.");
      if (!/[!@#$%^&*]/.test(value))
        passwordErrors.push("Must contain at least 1 special character.");
      if (value === enrollment)
        passwordErrors.push("Should not be the same as the enrollment number.");
      if (passwordErrors.length > 0) validationErrors.password = passwordErrors;
      else delete validationErrors.password;
    }

    if (field === "confirmPassword" && value !== password) {
      validationErrors.confirmPassword = "Passwords do not match.";
    } else {
      delete validationErrors.confirmPassword;
    }

    setErrors(validationErrors);
  };

  // Handle Input Changes
  const handleInputChange = (setter, field) => (e) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setter(e.target.value);
    validate(field, e.target.value);
  };

  // Handle Signup API Call
  // Using Supabase for signup instead of fetch
const handleSignup = async (e) => {
  e.preventDefault();

  if (Object.keys(errors).length > 0) {
    alert("Please fix the errors before submitting.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const { data, error } = await supabase.from("users").insert([
      {
        name,
        enrollment,
        password, // Consider hashing password before inserting
      },
    ]);

    if (error) {
      throw error;
    }

    alert("✅ Signup successful! 🎉");
    navigate("/login");
  } catch (error) {
    console.error("❌ Error:", error.message);
    alert("Signup failed. Please try again.");
  }
};


  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Create an Account</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            style={inputStyle}
            value={name}
            onChange={handleInputChange(setName, "name")}
          />
          {touched.name && errors.name && (
            <p style={errorStyle}>{errors.name}</p>
          )}

          <input
            type="text"
            placeholder="Enrollment Number"
            style={inputStyle}
            value={enrollment}
            onChange={handleInputChange(setEnrollment, "enrollment")}
          />
          {touched.enrollment && errors.enrollment && (
            <p style={errorStyle}>{errors.enrollment}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            style={inputStyle}
            value={password}
            onChange={handleInputChange(setPassword, "password")}
          />
          {touched.password && errors.password && (
            <ul style={errorListStyle}>
              {errors.password.map((err, index) => (
                <li key={index} style={errorStyle}>
                  {err}
                </li>
              ))}
            </ul>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            style={inputStyle}
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p style={errorStyle}>{errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor:
                Object.keys(errors).length === 0 ? "#FF4F5A" : "#ccc",
              cursor:
                Object.keys(errors).length === 0 ? "pointer" : "not-allowed",
            }}
            disabled={Object.keys(errors).length !== 0}
          >
            Sign Up
          </button>
        </form>
        <p style={linkStyle} onClick={() => navigate("/login")}>
          Already have an account? Sign In
        </p>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#F2F1EF",
  overflow: "hidden",
};

const boxStyle = {
  width: "90%",
  maxWidth: "400px",
  padding: "24px",
  borderRadius: "16px",
  backgroundColor: "white",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "8px 0",
  borderRadius: "8px",
  border: "1px solid #ddd",
  backgroundColor: "#f8f8f8",
  fontSize: "14px",
  color: "#000",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  margin: "12px 0",
  borderRadius: "8px",
  border: "none",
  color: "white",
  fontSize: "16px",
};

const linkStyle = {
  fontSize: "14px",
  marginTop: "16px",
  color: "#555",
  cursor: "pointer",
};

const errorStyle = {
  fontSize: "12px",
  color: "red",
  textAlign: "left",
};

const errorListStyle = {
  textAlign: "left",
  paddingLeft: "12px",
};

export default SignupPage;
