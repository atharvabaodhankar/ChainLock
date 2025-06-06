
import React, { useState } from "react";
import { supabase } from "./supabaseClient";


const Login = ({ onLogin, metamaskAddress }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !metamaskAddress) {
      setMsg("All fields and MetaMask connection required.");
      return;
    }
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) {
      setMsg("Profile not found.");
      return;
    }
    if (profile.metamask_address.toLowerCase() !== metamaskAddress.toLowerCase()) {
      setMsg("MetaMask address does not match registered address.");
      return;
    }
    setMsg("Login successful!");
    onLogin(profile);
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
      <div>{msg}</div>
    </form>
  );
};

export default Login;