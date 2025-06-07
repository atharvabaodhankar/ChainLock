
import React, { useState } from "react";
import { supabase } from "./supabaseClient";


const Login = ({ onLogin, metamaskAddress }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // For first-time profile creation
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
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {/* Only show username input if first login/profile missing */}
      {msg.includes("First login detected") && (
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      )}
      <button type="submit">Login</button>
      <div>{msg}</div>
    </form>
  );
};

export default Login;