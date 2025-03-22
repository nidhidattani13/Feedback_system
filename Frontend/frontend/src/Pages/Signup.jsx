import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import supabase from "../../../../Backend/supabaseClient";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // For typing animation - improved approach
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

  // Improved typing effect that ensures no characters are missed
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
          // Update displayed text with the next character
          setDisplayedText(
            fullTextRef.current.substring(0, charIndexRef.current + 1)
          );
          charIndexRef.current++;
        } else {
          // Animation complete
          clearInterval(typingTimerRef.current);
          setIsTyping(false);
        }
      }, 50); // Slightly slower for better readability

      return () => {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
        }
      };
    }
  }, [step]);

  // Validation Logic
  const validate = (field, value) => {
    let validationErrors = { ...errors };

    if (field === "name" && value && !/^[A-Za-z ]+$/.test(value)) {
      validationErrors.name = "Name should only contain alphabets.";
    } else {
      delete validationErrors.name;
    }

    if (field === "enrollment" && value && !/^[0-9]{11}$/.test(value)) {
      validationErrors.enrollment =
        "Enrollment number must be exactly 11 digits.";
    } else {
      delete validationErrors.enrollment;
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
      if (passwordErrors.length > 0) validationErrors.password = passwordErrors;
      else delete validationErrors.password;
    }

    if (field === "confirmPassword" && value && value !== password) {
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

  const handleContinue = () => {
    // Validate current step before proceeding
    if (step === 2 && (!name || errors.name)) {
      toast.error("Please enter a valid name.");
      return;
    }

    if (step === 3 && (!enrollment || errors.enrollment)) {
      toast.error("Please enter a valid 11-digit enrollment number.");
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
      setStep(step + 1);
    } else {
      // All steps completed, submit the form
      handleSignup();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isTyping) {
      handleContinue();
    }
  };

  // Handle Signup API Call
  const handleSignup = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
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

      toast.success("✅ Signup successful! Redirecting to login... 🎉");
      setTimeout(() => navigate("/login"), 1500); // Redirect to login after 1.5 sec
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error("Signup failed. Please try again.");
    }
  };

  // Render the appropriate input field based on the step
  const renderInputField = () => {
    if (step === 2) {
      return (
        <div className="input-field welcome-input">
          <input
            id="name-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={handleInputChange(setName, "name")}
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
            onChange={handleInputChange(setEnrollment, "enrollment")}
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
            onChange={handleInputChange(setPassword, "password")}
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
            onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
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
            {/* Use a pre-element to ensure text spacing is preserved */}
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
