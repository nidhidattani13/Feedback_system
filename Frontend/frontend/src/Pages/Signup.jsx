import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  
  const typingTimerRef = useRef(null);
  const fullTextRef = useRef("");
  const charIndexRef = useRef(0);

  // Welcome texts and questions
  const welcomeTexts = [
    "Hey, I am Phineas. I am your Assesment System Guide.",
    "Lets get you started and signed up quickly.",
    "What's your name?",
    "Please enter your 11-digit enrollment number.",
    "Create a secure password for your account.",
    "Please confirm your password.",
  ];

  // Memoized validation function to reduce unnecessary re-renders
  const validate = useCallback((field, value) => {
    const { enrollment, password } = formData;
    
    if (field === "name" && value && !/^[A-Za-z ]+$/.test(value)) {
      return "Name should only contain alphabets.";
    } 
    
    if (field === "enrollment" && value && !/^\d{4}$|^\d{11}$/.test(value)) {
      return "Enrollment number must be either 6 digits (faculty) or 11 digits (student).";
    } 
    
    if (field === "password" && value) {
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
      
      return passwordErrors.length > 0 ? passwordErrors : null;
    }
    
    if (field === "confirmPassword" && value && value !== password) {
      return "Passwords do not match.";
    }
    
    return null;
  }, [formData]);

  // Handle Input Changes with optimized validation
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const validationResult = validate(field, value);
    setErrors(prev => {
      if (validationResult) {
        return { ...prev, [field]: validationResult };
      } else {
        const { [field]: removed, ...rest } = prev;
        return rest;
      }
    });
  }, [validate]);

  // Improved typing effect that runs only when step changes
  useEffect(() => {
    if (step < welcomeTexts.length) {
      // Reset animation state
      setIsTyping(true);
      setDisplayedText("");
      fullTextRef.current = welcomeTexts[step];
      charIndexRef.current = 0;

      // Clear any existing interval
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }

      // Start a new typing interval
      typingTimerRef.current = setInterval(() => {
        if (charIndexRef.current < fullTextRef.current.length) {
          setDisplayedText(prev => 
            fullTextRef.current.substring(0, charIndexRef.current + 1)
          );
          charIndexRef.current++;
        } else {
          // Animation complete
          clearInterval(typingTimerRef.current);
          setIsTyping(false);
        }
      }, 50);

      return () => {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
        }
      };
    }
  }, [step]);

  const handleContinue = useCallback(() => {
    const { name, enrollment, password, confirmPassword } = formData;
    
    // Validate current step before proceeding
    if (step === 2 && (!name || errors.name)) {
      toast.error("Please enter a valid name.");
      return;
    }

    if (step === 3 && (!enrollment || errors.enrollment)) {
      toast.error("Please enter a valid enrollment number.");
      return;
    }

    if (step === 4 && (!password || errors.password)) {
      toast.error("Please enter a valid password.");
      return;
    }

    if (step === 5 && (!confirmPassword || errors.confirmPassword)) {
      toast.error("Passwords do not match.");
      return;
    }

    if (step < welcomeTexts.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // All steps completed, submit the form
      handleSignup();
    }
  }, [step, formData, errors]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !isTyping) {
      handleContinue();
    }
  }, [isTyping, handleContinue]);

  // Handle Signup API Call with improved error handling and redirect
  const handleSignup = async () => {
    const { name, enrollment, password, confirmPassword } = formData;
    
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          enrollment,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      // Success path
      toast.success("✅ Signup successful! Redirecting to login... 🎉");
      // Ensure redirect happens even if component unmounts
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error(error.message || "Signup failed. Please try again.");
    }
  };

  // Render the appropriate input field based on the step
  const renderInputField = () => {
    const { name, enrollment, password, confirmPassword } = formData;
    
    if (step === 2) {
      return (
        <div className="input-field welcome-input">
          <input
            id="name-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={handleInputChange("name")}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {touched.name && errors.name && (
            <p className="error-message">{errors.name}</p>
          )}
        </div>
      );
    } else if (step === 3) {
      return (
        <div className="input-field welcome-input">
          <input
            id="enrollment-input"
            type="text"
            placeholder="11-digit enrollment number"
            value={enrollment}
            onChange={handleInputChange("enrollment")}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {touched.enrollment && errors.enrollment && (
            <p className="error-message">{errors.enrollment}</p>
          )}
        </div>
      );
    } else if (step === 4) {
      return (
        <div className="input-field welcome-input">
          <input
            id="password-input"
            type="password"
            placeholder="Create password"
            value={password}
            onChange={handleInputChange("password")}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {touched.password && errors.password && (
            <ul className="error-list">
              {errors.password.map((err, index) => (
                <li key={index} className="error-message">
                  {err}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    } else if (step === 5) {
      return (
        <div className="input-field welcome-input">
          <input
            id="confirm-password-input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword}</p>
          )}
        </div>
      );
    }

    return null;
  };

  // Button text based on step
  const getButtonText = () => {
    if (step < 2) {
      return "Continue";
    } else if (step < welcomeTexts.length - 1) {
      return "Next";
    } else {
      return "Sign Up";
    }
  };

  return (
    <motion.div
      className="signup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="signup-card">
        <div className="welcome-content">
          <motion.div
            className="assistant-avatar"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="avatar-image">PH</div>
          </motion.div>

          <div className="message-bubble">
            <p className="welcome-text">{displayedText}</p>
            {renderInputField()}
            {!isTyping && (
              <motion.button
                className="continue-button"
                onClick={handleContinue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                disabled={isTyping}
              >
                {getButtonText()}
              </motion.button>
            )}
          </div>
        </div>

        <p className="login-link" onClick={() => navigate("/login")}>
          Already have an account? Sign In
        </p>
      </div>

      <style jsx>{`
        .signup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f2f1ef;
          padding: 1rem;
        }

        .signup-card {
          width: 90%;
          max-width: 420px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          padding: 1.8rem;
          display: flex;
          flex-direction: column;
          min-height: 320px;
        }

        .welcome-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-grow: 1;
        }

        .assistant-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #ff4f5a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.8rem;
        }

        .avatar-image {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .message-bubble {
          width: 100%;
          min-height: 100px;
          display: flex;
          flex-direction: column;
        }

        .welcome-text {
          margin: 0;
          line-height: 1.4;
          font-size: 1.1rem;
          color: #333;
          min-height: 1.4rem;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .continue-button {
          background: #ff4f5a;
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          cursor: pointer;
          margin-top: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s;
          align-self: flex-end;
        }

        .continue-button:hover {
          background: #ff3a47;
        }

        .continue-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .welcome-input {
          margin-top: 0.8rem;
          width: 100%;
        }

        .input-field {
          margin-bottom: 0.5rem;
        }

        .input-field input {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          background-color: #f8f8f8;
          font-size: 0.95rem;
          color: #333;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field input:focus {
          border-color: #ff4f5a;
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 79, 90, 0.2);
        }

        .error-message {
          font-size: 0.8rem;
          color: #ff3a47;
          margin: 0.3rem 0 0 0.2rem;
        }

        .error-list {
          list-style-type: none;
          padding-left: 0.2rem;
          margin: 0.3rem 0 0 0;
        }

        .error-list li {
          font-size: 0.8rem;
          color: #ff3a47;
          margin-bottom: 0.2rem;
        }

        .login-link {
          text-align: center;
          font-size: 0.9rem;
          color: #555;
          margin-top: 1rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: #ff4f5a;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Signup;