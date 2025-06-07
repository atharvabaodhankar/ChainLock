
import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const Register = ({ onRegistered, metamaskAddress }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || !metamaskAddress) {
      setMsg("All fields and MetaMask connection required.");
      return;
    }
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
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Register</button>
      <div>{msg}</div>
    </form>
  );
};

export default Register;