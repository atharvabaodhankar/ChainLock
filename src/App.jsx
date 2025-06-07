import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getVaultContract } from "./contract";
import Register from "./Register";
import Login from "./Login";
import "./App.css";
import {
  NetworkStatus,
  isPolygonAmoyNetwork,
  switchToPolygonAmoy,
  POLYGON_AMOY_NETWORK,
} from "./networkUtils";

// Helper function to detect if we're in MetaMask browser
const isMetaMaskBrowser = () => {
  return window.ethereum?.isMetaMask && navigator.userAgent.includes("Mobile");
};

// Helper function to detect if we're on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper function to get MetaMask deep link
const getMetaMaskDeepLink = () => {
  const currentUrl = encodeURIComponent(window.location.href);
  // If iOS, use different format
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return `metamask://dapp/${currentUrl}`;
  }
  // For Android
  return `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
};

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
  const [networkStatus, setNetworkStatus] = useState(
    NetworkStatus.NOT_CONNECTED
  );
  const [showMetaMaskPrompt, setShowMetaMaskPrompt] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        // First check if we're on the right network
        const isCorrectNetwork = await isPolygonAmoyNetwork();
        if (!isCorrectNetwork) {
          setNetworkStatus(NetworkStatus.WRONG_NETWORK);
          const switched = await switchToPolygonAmoy();
          if (!switched) {
            alert("Please switch to Polygon Amoy network manually in MetaMask");
            return;
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        const signer = await provider.getSigner();
        const vault = getVaultContract(signer);
        setContract(vault);
        setNetworkStatus(NetworkStatus.CONNECTED);
      } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect wallet: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const checkAndUpdateNetwork = async () => {
    if (!window.ethereum) return;

    const isCorrectNetwork = await isPolygonAmoyNetwork();
    setNetworkStatus(
      isCorrectNetwork ? NetworkStatus.CONNECTED : NetworkStatus.WRONG_NETWORK
    );
  };

  // Add password function with network check
  const addPassword = async () => {
    if (!platform || !password)
      return alert("Both platform and password are required!");

    const isCorrectNetwork = await isPolygonAmoyNetwork();
    if (!isCorrectNetwork) {
      alert("Please switch to Polygon Amoy network to add passwords");
      return;
    }

    setLoading(true);
    try {
    
      const tx = await contract.addPassword(platform, password);
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
    const isCorrectNetwork = await isPolygonAmoyNetwork();
    if (!isCorrectNetwork) {
      setVaultData([]);
      return;
    }

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
    setVisiblePasswords((prev) => {
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
      const handleAccountsChanged = async (accounts) => {
        if (
          user &&
          accounts[0]?.toLowerCase() !== user.metamask_address?.toLowerCase()
        ) {
          setUser(null);
          setAuthState("login");
        }
        setAccount(accounts[0]);
        // Reconnect contract to the new signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const vault = getVaultContract(signer);
        setContract(vault);
      };

      const handleChainChanged = () => {
        // MetaMask recommends reloading the page on chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [user]);

  // Check network status whenever account changes
  useEffect(() => {
    if (account) {
      checkAndUpdateNetwork();
    }
  }, [account]);

  useEffect(() => {
    // Check if we're on mobile but not in MetaMask browser
    if (isMobile() && !isMetaMaskBrowser()) {
      setShowMetaMaskPrompt(true);
    }
  }, []);

  // If we should show MetaMask prompt, show it before anything else
  if (showMetaMaskPrompt) {
    return (
      <div className="container metamask-prompt">
        <div className="metamask-prompt-card">
          <h2>Open in MetaMask</h2>
          <p>
            For the best experience, please open this app in the MetaMask
            browser.
          </p>
          <div className="metamask-prompt-actions">
            <a href={getMetaMaskDeepLink()} className="open-metamask-btn">
              Open in MetaMask
            </a>
            <button
              className="continue-anyway-btn"
              onClick={() => setShowMetaMaskPrompt(false)}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container">
        <h1>🔐 ChainLock</h1>
        <p>Secure password storage on the blockchain</p>
        <button
          className="connect-btn"
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            "Connect MetaMask"
          )}
        </button>
      </div>
    );
  }

  if (networkStatus === NetworkStatus.WRONG_NETWORK) {
    return (
      <div className="container">
        <h1>🔐 ChainLock</h1>
        <div className="network-warning">
          <p>Please connect to Polygon Amoy network to continue</p>
          <div className="network-info">
            <p>Network Name: {POLYGON_AMOY_NETWORK.chainName}</p>
            <p>Chain ID: {POLYGON_AMOY_NETWORK.chainId}</p>
            <p>RPC URL: {POLYGON_AMOY_NETWORK.rpcUrls[0]}</p>
          </div>
          <button
            className="action-btn"
            onClick={switchToPolygonAmoy}
            disabled={loading}
          >
            {loading ? "Switching Network..." : "Switch Network"}
          </button>
        </div>
      </div>
    );
  }

  if (authState === "register") {
    return (
      <Register
        metamaskAddress={account}
        onRegistered={() => setAuthState("login")}
        onLoginClick={() => setAuthState("login")}
        networkStatus={networkStatus}
        onSwitchNetwork={switchToPolygonAmoy}
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

          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner(); // get correct signer again
            const vault = getVaultContract(signer); // create new contract instance
            setContract(vault); // update contract in state
            const data = await vault.getPasswords(); // fetch with the updated contract
            setVaultData(data);
          } catch (err) {
            console.error("Failed to fetch initial passwords:", err);
          }
        }}
        networkStatus={networkStatus}
        onSwitchNetwork={switchToPolygonAmoy}
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
          <small>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </small>
          <div className="network-status">
            {networkStatus === NetworkStatus.CONNECTED ? (
              <span className="network-badge connected">
                Connected to Polygon Amoy
              </span>
            ) : (
              <div className="network-warning">
                <span className="network-badge wrong-network">
                  Wrong Network
                </span>
                <button
                  className="switch-network-btn"
                  onClick={switchToPolygonAmoy}
                  disabled={loading}
                >
                  Switch to Polygon Amoy
                </button>
              </div>
            )}
          </div>
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
          disabled={loading || networkStatus !== NetworkStatus.CONNECTED}
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
            disabled={loading || networkStatus !== NetworkStatus.CONNECTED}
            className="refresh-btn"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {vaultData.length === 0 ? (
          <p className="empty-state">
            {networkStatus !== NetworkStatus.CONNECTED
              ? "Please connect to Polygon Amoy network to view your passwords"
              : "No passwords stored yet. Add your first password above!"}
          </p>
        ) : (
          <ul className="password-list">
            {vaultData.map((item, i) => (
              <li key={i} className="password-item">
                <div className="platform-name">{item.title}</div>
                <div className="password-value">
                  <span className="password-text">
                    {visiblePasswords.has(i)
                      ? item.encryptedPassword
                      : "••••••••"}
                  </span>
                  <div className="password-actions">
                    <button
                      className="icon-btn"
                      onClick={() => togglePasswordVisibility(i)}
                      title={
                        visiblePasswords.has(i)
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {visiblePasswords.has(i) ? "👁️" : "👁️‍🗨️"}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => {
                        const el = document.createElement("textarea");
                        el.value = item.encryptedPassword;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand("copy");
                        document.body.removeChild(el);
                        alert("Password copied to clipboard!");
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
        onClick={() => {
          setUser(null);
          setAuthState("login");
        }}
        className="logout-btn"
      >
        Logout
      </button>
    </div>
  );
}

export default App;
