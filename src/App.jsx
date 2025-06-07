import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getVaultContract } from "./contract";
import Register from "./Register";
import Login from "./Login";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [platform, setPlatform] = useState("");
  const [password, setPassword] = useState("");
  const [vaultData, setVaultData] = useState([]);
  const [authState, setAuthState] = useState("login"); // "register" | "login" | "dashboard"
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

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
    if (!platform || !password) return alert("Both platform and password are required!");
    setLoading(true);
    try {
      const tx = await contract.addPassword(platform, password, { gasLimit: 1000000 });
      await tx.wait();
      alert("Password added successfully ✅");
      setPlatform("");
      setPassword("");
      fetchPasswords();
    } catch (err) {
      console.error(err);
      alert("Failed to add password.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const data = await contract.getPasswords();
      setVaultData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (index) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    connectWallet();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (user && accounts[0]?.toLowerCase() !== user.metamask_address?.toLowerCase()) {
          setUser(null);
          setAuthState("login");
        }
        setAccount(accounts[0]);
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [user]);

  if (!account) {
    return (
      <div className="container">
        <h1>🔐 ChainLock</h1>
        <p>Secure password storage on the blockchain</p>
        <button className="connect-btn" onClick={connectWallet}>Connect MetaMask</button>
      </div>
    );
  }
  if (authState === "register") {
    return (
      <Register
        metamaskAddress={account}
        onRegistered={() => setAuthState("login")}
        onLoginClick={() => setAuthState("login")}
      />
    );
  }

  if (authState === "login") {
    return (
      <Login
        metamaskAddress={account}
        onRegisterClick={() => setAuthState("register")}
        onLogin={async (profile) => {
            setUser(profile);
            setAuthState("dashboard");
            // Fetch passwords after successful login
            try {
              const data = await contract.getPasswords();
              setVaultData(data);
            } catch (err) {
              console.error("Failed to fetch initial passwords:", err);
            }
          }}
      />
    );
  }

  // Dashboard
  return (
    <div className="container">
      <header>
        <h1>🔐 Password Vault</h1>
        <div className="user-info">
          <p>Welcome, {user?.username}!</p>
          <small>Connected: {account.slice(0, 6)}...{account.slice(-4)}</small>
        </div>
      </header>

      <div className="add-password-form">
        <input
          type="text"
          placeholder="Platform (e.g., Gmail, Twitter)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button 
          onClick={addPassword} 
          disabled={loading} 
          className="action-btn"
        >
          {loading ? "Adding..." : "Add Password"}
        </button>
      </div>

      <div className="vault-section">
        <div className="vault-header">
          <h2>Your Passwords</h2>
          <button 
            onClick={fetchPasswords} 
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {vaultData.length === 0 ? (
          <p className="empty-state">No passwords stored yet. Add your first password above!</p>
        ) : (
          <ul className="password-list">
            {vaultData.map((item, i) => (
              <li key={i} className="password-item">
                <div className="platform-name">{item.title}</div>
                <div className="password-value">
                  <span className="password-text">
                    {visiblePasswords.has(i) ? item.encryptedPassword : '••••••••'}
                  </span>
                  <div className="password-actions">
                    <button 
                      className="icon-btn"
                      onClick={() => togglePasswordVisibility(i)}
                      title={visiblePasswords.has(i) ? "Hide password" : "Show password"}
                    >
                      {visiblePasswords.has(i) ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={() => {
                        const el = document.createElement('textarea');
                        el.value = item.encryptedPassword;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand('copy');
                        document.body.removeChild(el);
                        alert('Password copied to clipboard!');
                      }}
                      title="Copy password"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        onClick={() => { setUser(null); setAuthState("login"); }}
        className="logout-btn"
      >
        Logout
      </button>
    </div>
  );
}

export default App;