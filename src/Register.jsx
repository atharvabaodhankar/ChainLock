import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Register.css";

const Register = ({ onRegistered, metamaskAddress, onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || !metamaskAddress) {
      setMsg("All fields and MetaMask connection required.");
      return;
    }
    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMsg("Registration failed: " + error.message);
        return;
      }
      setMsg("Registration successful! Please check your email to confirm.");
      onRegistered({ email, username, metamaskAddress });
    } catch (error) {
      setMsg("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p className="register-subtitle">
            Join ChainLock to secure your passwords
          </p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="metamask-status">
            <span className="icon">🦊</span>
            <span
              className={`status ${
                metamaskAddress ? "connected" : ""
              }`}
            >
              {metamaskAddress
                ? "MetaMask Connected"
                : "Please connect MetaMask"}
            </span>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="auth-switch">
            <p>Already have an account?</p>
            <button
              type="button"
              className="switch-button"
              onClick={onLoginClick}
            >
              Login Instead
            </button>
          </div>

          {msg && (
            <div
              className={`message ${
                msg.includes("successful") ? "success" : "error"
              }`}
            >
              {msg.includes("successful") ? "✅ " : "❌ "}
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;