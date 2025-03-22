import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WelcomeIntroduction = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [department, setDepartment] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState("");

  const welcomeTexts = [
    "Hi, I'm your Faculty Dashboard Assistant.",
    "Before we begin, I'd like to get to know you better.",
    "What should I call you?",
  ];

  // Simulates typing effect
  useEffect(() => {
    if (step < welcomeTexts.length) {
      setIsTyping(true);
      setDisplayedText("");

      let i = 0;
      const currentText = welcomeTexts[step];

      const typingInterval = setInterval(() => {
        if (i < currentText.length) {
          setDisplayedText((prev) => prev + currentText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [step]);

  const handleContinue = () => {
    if (step < welcomeTexts.length - 1) {
      setStep(step + 1);
    } else if (step === welcomeTexts.length - 1) {
      // Move to name input - show the input form
      setStep(step + 1);
    } else if (step === welcomeTexts.length && userName.trim()) {
      // Move to department selection
      setStep(step + 1);
    } else if (step === welcomeTexts.length + 1 && department) {
      // Complete the introduction
      onComplete({ name: userName, department });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  const departments = [
    "Information and Communication Technology",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "IT",
  ];

  return (
    <motion.div
      className="welcome-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="welcome-card">
        <div className="welcome-content">
          {step < welcomeTexts.length && (
            <>
              <motion.div
                className="assistant-avatar"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="avatar-image">FD</div>
              </motion.div>

              <div className="message-bubble">
                <p>{displayedText}</p>
                {!isTyping && (
                  <>
                    {step < welcomeTexts.length - 1 ? (
                      <motion.button
                        className="continue-button"
                        onClick={handleContinue}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Continue
                      </motion.button>
                    ) : (
                      // Show input form immediately after last text message
                      <motion.div
                        className="name-input-container"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name"
                          className="name-input"
                          onKeyPress={handleKeyPress}
                          autoFocus
                        />
                        <motion.button
                          className={`continue-name-button ${
                            !userName.trim() ? "disabled" : ""
                          }`}
                          onClick={handleContinue}
                          disabled={!userName.trim()}
                          whileHover={userName.trim() ? { scale: 1.05 } : {}}
                        >
                          Next
                        </motion.button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {step === welcomeTexts.length && (
            <motion.div
              className="input-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label>Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={handleKeyPress}
                autoFocus
                className="full-input"
              />
              <motion.button
                className={`primary-button ${
                  !userName.trim() ? "disabled" : ""
                }`}
                onClick={handleContinue}
                disabled={!userName.trim()}
                whileHover={userName.trim() ? { scale: 1.05 } : {}}
              >
                Next
              </motion.button>
            </motion.div>
          )}

          {step === welcomeTexts.length + 1 && (
            <motion.div
              className="input-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label>Hello, {userName}! What department are you from?</label>
              <div className="department-selection">
                {departments.map((dept) => (
                  <motion.div
                    key={dept}
                    className={`department-option ${
                      department === dept ? "selected" : ""
                    }`}
                    onClick={() => setDepartment(dept)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {dept}
                  </motion.div>
                ))}
              </div>
              <motion.button
                className={`primary-button ${!department ? "disabled" : ""}`}
                onClick={handleContinue}
                disabled={!department}
                whileHover={department ? { scale: 1.05 } : {}}
              >
                Get Started
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .welcome-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .welcome-card {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .welcome-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-height: 250px;
        }
        
        .assistant-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #FF4F5A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .avatar-image {
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .message-bubble {
          max-width: 100%;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .message-bubble p {
          margin: 0;
          line-height: 1.5;
          font-size: 1.1rem;
        }
        
        .continue-button {
          background: #FF4F5A;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          margin-top: 1rem;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .continue-button:hover {
          background: #ff3a47;
        }
        
        /* Name input inside message bubble */
        .name-input-container {
          display: flex;
          width: 100%;
          margin-top: 1rem;
          gap: 0.5rem;
        }
        
        .name-input {
          flex: 1;
          padding: 0.6rem 1rem;
          border: 2px solid #ddd;
          border-radius: 20px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        
        .name-input:focus {
          border-color: #FF4F5A;
          outline: none;
        }
        
        .continue-name-button {
          background: #FF4F5A;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        
        .continue-name-button:hover {
          background: #ff3a47;
        }
        
        .continue-name-button.disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        /* Full-page input form */
        .input-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .input-container label {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }
        
        .full-input {
          padding: 0.8rem 1rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          width: 100%;
          transition: border-color 0.2s;
        }
        
        .full-input:focus {
          border-color: #FF4F5A;
          outline: none;
        }
        
        .primary-button {
          background: #FF4F5A;
          color: white;
          border: none;
          padding: 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }
        
        .primary-button:hover {
          background: #ff3a47;
        }
        
        .primary-button.disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .department-selection {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .department-option {
          background: #f0f2f5;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .department-option:hover {
          background: #e4e6eb;
        }
        
        .department-option.selected {
          background: #ffeaec;
          border-color: #FF4F5A;
          color: #FF4F5A;
          font-weight: 500;
        }
        
        @media (max-width: 480px) {
          .welcome-card {
            padding: 1.5rem;
          }
          
          .name-input-container {
            flex-direction: column;
          }
          
          .department-selection {
            flex-direction: column;
          }
          
          .department-option {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default WelcomeIntroduction;