import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const Register = ({ onRegistered, metamaskAddress }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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
    <div className="auth-container">
      <h2>Create Account 🚀</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            placeholder="Choose a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="action-btn"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
        {msg && <div className={`message ${msg.includes("successful") ? "success" : "error"}`}>{msg}</div>}
      </form>
    </div>
  );
};

export default Register;