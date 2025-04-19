import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../Backend/supabaseClient";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for authentication state on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already authenticated
        handleUserData(session.user);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          handleUserData(session.user);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Process user data and redirect after successful authentication
  const handleUserData = async (user) => {
    try {
      // First check if user exists in our database
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, other errors should be handled
        console.error("Error fetching user:", fetchError);
        return;
      }
      
      if (existingUser) {
        // User exists, store data and redirect
        localStorage.setItem("token", user.id);
        localStorage.setItem("userData", JSON.stringify(existingUser));
        
        // Redirect based on enrollment number pattern
        if (/^\d{11}$/.test(existingUser.enrollment)) {
          navigate("/student-dashboard");
        } else if (/^\d{4}$/.test(existingUser.enrollment)) {
          navigate("/faculty-dashboard");
        } else {
          navigate("/admin-dashboard");
        }
      } else {
        // New user, redirect to profile completion page
        localStorage.setItem("token", user.id);
        localStorage.setItem("tempUserData", JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || '',
        }));
        navigate("/complete-profile");
      }
    } catch (error) {
      console.error("Error processing user data:", error.message);
      alert("Authentication successful but error processing user data: " + error.message);
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enrollment, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Store user data locally
    localStorage.setItem("token", "user-logged-in");
    localStorage.setItem("userData", JSON.stringify(result.user));

    alert("Login successful!");

    // Redirect based on enrollment type
    if (/^\d{11}$/.test(enrollment)) {
      navigate("/student-dashboard");
    } else if (/^\d{6}$/.test(enrollment)) {
      navigate("/faculty-dashboard");
    } else {
      navigate("/admin-dashboard");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Note: The redirect happens automatically, and the auth state change
      // listener will handle the post-authentication logic
    } catch (error) {
      console.error("Google login error:", error.message);
      alert("Google login failed: " + error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left panel with enhanced symbiote effect */}
        <div className="left-panel">
          <div className="symbiote-mask"></div>
          <div className="logo">PHINEAS</div>
          <div className="tagline">
            <h2>Gateway to Campus Excellence</h2>
            <p>Sign in to access your personalized academic portal</p>
          </div>
          <div className="slide-indicators">
            <span className="indicator"></span>
            <span className="indicator"></span>
            <span className="indicator active"></span>
          </div>
        </div>

        {/* Right panel preserved as in the screenshot */}
        <div className="right-panel">
          <div className="form-container">
            <h1>Welcome Back</h1>
            <p className="account-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")}>
                Create New Account
              </span>
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="enrollment">Enrollment Number</label>
                <div className="input-wrapper">
                  <input
                    id="enrollment"
                    type="text"
                    placeholder="Enter your enrollment number"
                    className="input-field"
                    value={enrollment}
                    onChange={(e) => setEnrollment(e.target.value)}
                    required
                  />
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span 
                    className="input-icon clickable" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="forgot-password-row">
                <div className="remember-me">
                  <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <p className="forgot-password">Forgot password?</p>
              </div>
              
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Sign In"}
              </button>
            </form>

            <div className="separator">
              <span>Or continue with</span>
            </div>

            <div className="social-logins">
              <button 
                className="social-button google-login" 
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
                <span>{googleLoading ? "Loading..." : "Google"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;