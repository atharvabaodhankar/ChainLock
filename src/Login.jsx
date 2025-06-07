import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Login.css";

const Login = ({ onLogin, metamaskAddress, onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !metamaskAddress) {
      setMsg("All fields and MetaMask connection required.");
      return;
    }
    setLoading(true);
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        setMsg("Invalid credentials.");
        return;
      }
      // Fetch profile
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      // If profile does not exist, create it (first login)
      if (profileError || !profile) {
        if (!username) {
          setMsg("First login detected. Please enter a username to complete your profile.");
          return;
        }
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email,
            username,
            metamask_address: metamaskAddress,
          },
        ]);
        if (insertError) {
          setMsg("Profile creation failed: " + insertError.message);
          return;
        }
        // Fetch the newly created profile
        const { data: newProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        profile = newProfile;
      }
      if (profile.metamask_address.toLowerCase() !== metamaskAddress.toLowerCase()) {
        setMsg("MetaMask address does not match registered address.");
        return;
      }
      setMsg("Login successful!");
      onLogin(profile);
    } catch (error) {
      setMsg("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Enter your credentials to access your vault</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
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
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

          {msg.includes("First login detected") && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
                />
              </div>
            </div>
          )}

          <div className="metamask-status">
            <span className="icon">🦊</span>
            <span className={`status ${metamaskAddress ? 'connected' : ''}`}>
              {metamaskAddress ? 'MetaMask Connected' : 'Please connect MetaMask'}
            </span>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </button>

          <div className="auth-switch">
            <p>Don't have an account?</p>
            <button 
              type="button"
              className="switch-button"
              onClick={onRegisterClick}
            >
              Register Now
            </button>
          </div>

          {msg && (
            <div className={`message ${msg.includes("successful") ? "success" : "error"}`}>
              {msg.includes("successful") ? "✅ " : "❌ "}
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;