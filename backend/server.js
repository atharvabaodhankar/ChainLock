const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Set up rate limiter: maximum of 3 requests per day per IP
const rateLimiter = new RateLimiterMemory({
  points: 3, // Number of points
  duration: 24 * 60 * 60, // Per 24 hours
});

// Set up Ethereum provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const faucetWallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY, provider);

// Store funded addresses to prevent multiple funding
const fundedAddresses = new Set();

// Endpoint to fund an address
app.post('/api/fund', async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ 
      success: false, 
      message: 'Address is required' 
    });
  }

  // Get client IP
  const clientIp = req.ip;

  try {
    // Check rate limit
    await rateLimiter.consume(clientIp);

    // Check if address is valid
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Ethereum address' 
      });
    }

    // Check if address was already funded
    if (fundedAddresses.has(address.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Address already funded' 
      });
    }

    // Check faucet balance
    const faucetBalance = await provider.getBalance(faucetWallet.address);
    const minBalance = ethers.parseEther("0.1"); // Keep some balance for gas
    
    if (faucetBalance < minBalance) {
      return res.status(503).json({ 
        success: false, 
        message: 'Faucet is running low on funds' 
      });
    }    // Send POL tokens (1 POL = 1 MATIC on Polygon Amoy)
    const amountToSend = ethers.parseEther("1.0"); // 1 POL
    const gasLimit = 21000; // Standard gas limit for ETH transfer
    
    const tx = await faucetWallet.sendTransaction({
      to: address,
      value: amountToSend,
      gasLimit: gasLimit
    });

    console.log(`Sending 1 POL to ${address}...`);
    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Add address to funded set
    fundedAddresses.add(address.toLowerCase());    // Calculate actual amount sent in POL
    const amountSent = ethers.formatEther(amountToSend);
    
    res.status(200).json({
      success: true,
      message: `Successfully sent ${amountSent} POL`,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      amount: amountSent
    });

  } catch (error) {
    if (error.message.includes('RATE_LIMIT')) {
      return res.status(429).json({ 
        success: false, 
        message: 'Rate limit exceeded. Try again later.' 
      });
    }

    console.error('Funding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fund address',
      error: error.message 
    });
  }
});

// Get faucet status
app.get('/api/status', async (req, res) => {
  try {
    const balance = await provider.getBalance(faucetWallet.address);
    res.json({
      success: true,
      balance: ethers.formatEther(balance),
      fundedAddresses: fundedAddresses.size
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get faucet status' 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Faucet server running on port ${PORT}`);
});
