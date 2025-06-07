import React, { useState } from "react";
import { supabase } from "./supabaseClient";


const Login = ({ onLogin, metamaskAddress }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // For first-time profile creation
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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
    <div className="auth-container">
      <h2>Welcome Back! 👋</h2>
      <form onSubmit={handleLogin} className="auth-form">
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
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {msg.includes("First login detected") && (
          <div className="form-group">
            <input
              className="input"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        <button 
          type="submit" 
          className="action-btn" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {msg && <div className={`message ${msg.includes("successful") ? "success" : "error"}`}>{msg}</div>}
      </form>
    </div>
  );
};

export default Login;