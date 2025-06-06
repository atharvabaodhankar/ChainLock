import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getVaultContract } from "./contract";
import Register from "./Register";
import Login from "./Login";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [vaultData, setVaultData] = useState([]);
  const [authState, setAuthState] = useState("login"); // "register" | "login" | "dashboard"
  const [user, setUser] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const signer = await provider.getSigner();
      const vault = getVaultContract(signer);
      setContract(vault);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const addPassword = async () => {
    if (!title || !password) return alert("Both fields are required!");
    try {
      const tx = await contract.addPassword(title, password, { gasLimit: 1000000 });
      await tx.wait();
      alert("Password added to blockchain ✅");
      setTitle("");
      setPassword("");
      fetchPasswords();
    } catch (err) {
      console.error(err);
      alert("Failed to add password.");
    }
  };

  const fetchPasswords = async () => {
    try {
      const data = await contract.getPasswords();
      setVaultData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  if (!account) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <button onClick={connectWallet}>Connect MetaMask</button>
      </div>
    );
  }

  if (authState === "register") {
    return (
      <Register
        metamaskAddress={account}
        onRegistered={() => setAuthState("login")}
      />
    );
  }

  if (authState === "login") {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <Login
          metamaskAddress={account}
          onLogin={(profile) => {
            setUser(profile);
            setAuthState("dashboard");
          }}
        />
        <p>
          Don't have an account?{" "}
          <button onClick={() => setAuthState("register")}>Register</button>
        </p>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🔐 ChainLock Vault</h1>
      <p>Connected as: {account}</p>
      <p>Welcome, {user?.username}!</p>
      <div>
        <input
          type="text"
          placeholder="Title (e.g., Gmail)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Encrypted Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={addPassword}>Add Password</button>
        <button onClick={fetchPasswords}>Load Vault</button>
      </div>
      <hr />
      <h2>Your Vault:</h2>
      <ul>
        {vaultData.map((item, i) => (
          <li key={i}>
            <strong>{item.title}:</strong> {item.encryptedPassword}
          </li>
        ))}
      </ul>
      <button onClick={() => { setUser(null); setAuthState("login"); }}>Logout</button>
    </div>
  );
}

export default App;