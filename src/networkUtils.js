import { ethers } from "ethers";

export const POLYGON_AMOY_NETWORK = {
  chainId: "0x13882", // 80002 in decimal
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
  faucetUrl: "https://faucet.polygon.technology/" // Adding faucet URL for reference
};

export const addPolygonAmoyNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [POLYGON_AMOY_NETWORK],
    });
    return true;
  } catch (error) {
    console.error("Failed to add Polygon Amoy network:", error);
    return false;
  }
};

export const switchToPolygonAmoy = async () => {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_AMOY_NETWORK.chainId }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, try adding it
      return await addPolygonAmoyNetwork();
    }
    console.error("Failed to switch to Polygon Amoy network:", error);
    return false;
  }
};

export const getCurrentNetwork = async () => {
  if (!window.ethereum) return null;

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return chainId;
  } catch (error) {
    console.error("Failed to get current network:", error);
    return null;
  }
};

export const isPolygonAmoyNetwork = async () => {
  const chainId = await getCurrentNetwork();
  return chainId === POLYGON_AMOY_NETWORK.chainId;
};

export const NetworkStatus = {
  NOT_CONNECTED: "not_connected",
  WRONG_NETWORK: "wrong_network",
  CONNECTED: "connected",
};
