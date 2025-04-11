import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../Backend/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left panel with background image and tagline */}
        <div className="left-panel">
          <div className="logo">PHINEAS</div>

          <div className="slide-indicators">
            <span className="indicator"></span>
            <span className="indicator"></span>
            <span className="indicator active"></span>
          </div>
        </div>

        {/* Right panel with login form */}
        <div className="right-panel">
          <div className="form-container">
            <h1>Sign in to your Account</h1>
            <p className="account-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")}>
                Create New Account
              </span>
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enrollment Number"
                  className="input-field"
                  value={enrollment}
                  onChange={(e) => setEnrollment(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="forgot-password">Forgot password?</p>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Continue"}
              </button>
            </form>

            <div className="separator">
              <span>Or sign in with</span>
            </div>

            <div className="social-logins">
              <button className="google-login">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Dont Sign In With GOOGLE</span>
              </button>
            </div>
          </div>
        </div>
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

        /* Login page container */
        .login-page {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1a1a1a;
          padding: 20px;
        }

        /* Main login container */
        .login-container {
          display: flex;
          width: 100%;
          max-width: 1000px;
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* Left panel */
        .left-panel {
          width: 50%;
          background-image: url("/path/to/desert-image.jpg");
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 30px;
          background: linear-gradient(135deg, #ff4f5a 0%, #800020 100%);
          color: white;
        }

        /* Logo */
        .logo {
          font-size: 24px;
          font-weight: bold;
        }

        /* Back to website link */
        .back-to-website {
          position: absolute;
          top: 30px;
          right: 30px;
        }

        .back-to-website a {
          color: white;
          text-decoration: none;
          background-color: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
        }

        .back-to-website a:after {
          content: "→";
          margin-left: 5px;
        }

        /* Tagline */
        .tagline {
          margin-bottom: 80px;
        }

        .tagline h2 {
          font-size: 36px;
          font-weight: 500;
          line-height: 1.3;
        }

        /* Slide indicators */
        .slide-indicators {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .indicator {
          width: 30px;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .indicator.active {
          background-color: white;
        }

        /* Right panel */
        .right-panel {
          width: 50%;
          background-color: #1a1a1a;
          color: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-container {
          max-width: 400px;
          margin: 0 auto;
        }

        /* Form header */
        .form-container h1 {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .account-link {
          margin-bottom: 30px;
          color: #999;
          font-size: 14px;
        }

        .account-link span {
          color: #ff4f5a;
          cursor: pointer;
          text-decoration: none;
        }

        .account-link span:hover {
          text-decoration: underline;
        }

        /* Form groups */
        .form-group {
          margin-bottom: 15px;
        }

        /* Input fields */
        .input-field {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #333;
          background-color: #2a2a2a;
          color: white;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #ff4f5a;
          box-shadow: 0 0 0 2px rgba(255, 79, 90, 0.2);
        }

        .input-field::placeholder {
          color: #999;
        }

        /* Forgot password */
        .forgot-password {
          font-size: 14px;
          color: #ff4f5a;
          text-align: right;
          margin: 10px 0 25px;
          cursor: pointer;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        /* Login button */
        .login-button {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background-color: #ff4f5a;
          color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button:hover {
          background-color: #ff3a47;
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Separator */
        .separator {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #999;
          font-size: 14px;
        }

        .separator:before,
        .separator:after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: #333;
        }

        .separator span {
          padding: 0 15px;
        }

        /* Social logins */
        .social-logins {
          display: flex;
          gap: 15px;
        }

        .google-login,
        .apple-login {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background-color: #2a2a2a;
          border: 1px solid #333;
          color: white;
          transition: background-color 0.2s;
        }

        .google-login:hover,
        .apple-login:hover {
          background-color: #333;
        }

        /* Media Queries */
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            height: auto;
          }

          .left-panel,
          .right-panel {
            width: 100%;
          }

          .left-panel {
            height: 250px;
            padding: 20px;
          }

          .right-panel {
            padding: 30px 20px;
          }

          .tagline {
            margin-bottom: 40px;
          }

          .tagline h2 {
            font-size: 28px;
          }
          /* Symbiote-inspired gradient for the left panel */
          .left-panel {
            width: 50%;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 30px;
            color: white;
            overflow: hidden;
            /* Remove the existing background */
            background-image: none;
            /* Base dark background */
            background-color: #000000;
          }

          /* Symbiote effect container */
          .left-panel::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            /* Create the main symbiote gradient base */
            background: radial-gradient(
              circle at 30% 40%,
              #ff0000 0%,
              #990000 30%,
              #550000 50%,
              #220000 70%,
              #000000 100%
            );
            /* Add more organic looking texture */
            background-blend-mode: multiply;
            z-index: 1;
          }

          /* Animated symbiote tendrils */
          .left-panel::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            right: -50%;
            bottom: -50%;
            background: 
    /* Multiple radial gradients for the organic, vein-like appearance */ radial-gradient(
                circle at 70% 60%,
                rgba(255, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0) 30%
              ),
              radial-gradient(
                circle at 20% 30%,
                rgba(255, 0, 0, 0.7) 0%,
                rgba(0, 0, 0, 0) 20%
              ),
              radial-gradient(
                circle at 90% 20%,
                rgba(255, 0, 0, 0.7) 0%,
                rgba(0, 0, 0, 0) 25%
              ),
              radial-gradient(
                circle at 10% 80%,
                rgba(255, 0, 0, 0.6) 0%,
                rgba(0, 0, 0, 0) 30%
              ),
              /* Vertical wavy tendrils */
                repeating-linear-gradient(
                  0deg,
                  transparent 0%,
                  rgba(200, 0, 0, 0.2) 2%,
                  transparent 3%,
                  rgba(200, 0, 0, 0.1) 5%
                ),
              /* Horizontal wavy tendrils */
                repeating-linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(200, 0, 0, 0.2) 1%,
                  transparent 2%,
                  rgba(200, 0, 0, 0.1) 3%
                );
            /* Add animation for flowing effect */
            animation: symbioteFlow 20s infinite alternate;
            /* Use screen blend mode for glowing effect */
            mix-blend-mode: screen;
            opacity: 0.8;
            z-index: 2;
          }

          /* Pulse effect for the symbiote */
          @keyframes symbioteFlow {
            0% {
              transform: rotate(0deg) scale(1);
            }
            25% {
              transform: rotate(5deg) scale(1.05);
            }
            50% {
              transform: rotate(-2deg) scale(1.02);
            }
            75% {
              transform: rotate(3deg) scale(1.07);
            }
            100% {
              transform: rotate(-3deg) scale(1.03);
            }
          }

          /* Ensure content stays above the background effects */
          .logo,
          .slide-indicators {
            position: relative;
            z-index: 3;
          }

          /* Add glow effect to the logo */
          .logo {
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
            letter-spacing: 1px;
          }

          /* Style the indicators to match symbiote theme */
          .indicator {
            width: 30px;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
            transition: all 0.5s ease;
          }

          .indicator.active {
            background-color: rgba(255, 0, 0, 0.8);
            box-shadow: 0 0 8px rgba(255, 0, 0, 0.7);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
