import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getVaultContract } from "./contract";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [vaultData, setVaultData] = useState([]);

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
      const tx = await contract.addPassword(title, password, {
        gasLimit: 1000000,
      });

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

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🔐 ChainLock Vault</h1>
      <p>Connected as: {account}</p>

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
    </div>
  );
}

export default App;
