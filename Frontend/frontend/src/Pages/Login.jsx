import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../Backend/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState([]);

  // Generate the dots with enhanced features
  useEffect(() => {
    generateDots();
    // Regenerate dots periodically for more dynamic effect
    const interval = setInterval(generateDots, 10000);
    return () => clearInterval(interval);
  }, []);

  const generateDots = () => {
    const newDots = [];
    const numDots = 60; // Increased number of dots
    const maxRadius = 350; // Maximum radius for the outer circle

    for (let i = 0; i < numDots; i++) {
      // Calculate a random radius between inner and outer circle
      const radius = Math.random() * maxRadius;
      
      // Calculate position on the circle
      const angle = (i / numDots) * Math.PI * 2 + Math.random() * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Size is inversely proportional to radius (smaller when closer to center)
      const proximityFactor = 1 - (radius / maxRadius);
      const size = 5 + (proximityFactor * 20);
      
      // Calculate clustering - dots closer to center should be more clustered
      const clusterOffset = proximityFactor * 20;
      const clusterX = x + (Math.random() * clusterOffset) - (clusterOffset / 2);
      const clusterY = y + (Math.random() * clusterOffset) - (clusterOffset / 2);
      
      // Animation duration varies based on distance from center
      const animDuration = 3 + (proximityFactor * 5);
      
      // Animation delay varies to create a more organic feel
      const animDelay = Math.random() * 5;

      newDots.push({
        id: i,
        x: clusterX,
        y: clusterY,
        size: size,
        proximity: proximityFactor,
        animDuration: animDuration,
        animDelay: animDelay
      });
    }

    setDots(newDots);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Query the users table to check credentials
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("enrollment", enrollment)
        .eq("password", password) // Note: In production, you should use proper password hashing
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Store user info in localStorage
        localStorage.setItem("token", "user-logged-in"); // Simple token example
        localStorage.setItem("userData", JSON.stringify(data));
        alert("Login Successful!");

        // Redirect based on enrollment number length
        if (/^\d{11}$/.test(enrollment)) {
          navigate("/student-dashboard");
        } else if (/^\d{4}$/.test(enrollment)) {
          navigate("/faculty-dashboard");
        } else {
          navigate("/admin-dashboard");
        }
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDots = () => {
    return dots.map(dot => {
      // Color transition from blue to red based on proximity
      const redValue = Math.floor(70 + (185 * dot.proximity));
      const blueValue = Math.floor(255 - (185 * dot.proximity));
      
      return (
        <div
          key={dot.id}
          className="dot"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `calc(50% + ${dot.x}px)`,
            top: `calc(50% + ${dot.y}px)`,
            opacity: 0.2 + (dot.proximity * 0.5),
            backgroundColor: `rgb(${redValue}, 70, ${blueValue})`,
            animationDuration: `${dot.animDuration}s`,
            animationDelay: `${dot.animDelay}s`,
          }}
        />
      );
    });
  };

  return (
    <div className="login-container">
      <div className="dots-container">{renderDots()}</div>
      <div className="login-box">
        <h2 className="login-title">Sign in to your Account</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enrollment Number"
            className="input-field"
            value={enrollment}
            onChange={(e) => setEnrollment(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="forgot-password">Forgot password?</p>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>
        <p className="create-account" onClick={() => navigate("/signup")}>
          Create New Account
        </p>
      </div>

      <style jsx>{`
        /* Global styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        /* Login container */
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          background-color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }

        /* Dots container */
        .dots-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Individual dot */
        .dot {
          position: absolute;
          border-radius: 50%;
          transition: all 0.3s ease;
          animation: floatComplex infinite ease-in-out;
        }

        @keyframes floatComplex {
          0% {
            transform: translateY(0) translateX(0) scale(1);
          }
          25% {
            transform: translateY(-15px) translateX(10px) scale(1.05);
          }
          50% {
            transform: translateY(-5px) translateX(15px) scale(1);
          }
          75% {
            transform: translateY(-20px) translateX(5px) scale(0.95);
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
        }

        /* Login box */
        .login-box {
          width: 100%;
          max-width: 400px;
          padding: 32px;
          border-radius: 16px;
          background-color: rgba(42, 42, 42, 0.8);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(255, 100, 100, 0.15);
          text-align: center;
          border: 1px solid #ff4f5a33;
          position: relative;
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        /* Title */
        .login-title {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 24px;
        }

        /* Input field */
        .input-field {
          width: 100%;
          padding: 12px;
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid #ff4f5a33;
          background-color: #333;
          color: #fff;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #ff4f5a;
          box-shadow: 0 0 0 2px #ff4f5a33;
        }

        .input-field::placeholder {
          color: #999;
        }

        /* Forgot password */
        .forgot-password {
          font-size: 14px;
          color: #ff4f5a;
          text-align: right;
          margin-top: 8px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .forgot-password:hover {
          color: #ff3a47;
        }

        /* Login button */
        .login-button {
          width: 100%;
          padding: 12px;
          margin-top: 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #ff4f5a 0%, #800020 100%);
          color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .login-button:hover {
          opacity: 0.9;
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Create account */
        .create-account {
          font-size: 14px;
          margin-top: 20px;
          color: #ccc;
          cursor: pointer;
          transition: color 0.2s;
        }

        .create-account:hover {
          color: #ff4f5a;
        }

        /* Media Queries */
        @media (max-width: 480px) {
          .login-box {
            max-width: 90%;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;