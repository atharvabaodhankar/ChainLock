const FAUCET_API = import.meta.env.VITE_FAUCET_API_URL;

// Validate environment variable
if (!FAUCET_API) {
  console.error('VITE_FAUCET_API is not defined in environment variables');
}

export const requestTestMatic = async (address) => {
  try {
    const response = await fetch(`${FAUCET_API}/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get test MATIC');
    }

    return data;
  } catch (error) {
    console.error('Faucet error:', error);
    throw error;
  }
};

export const getFaucetStatus = async () => {
  try {
    const response = await fetch(`${FAUCET_API}/status`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get faucet status');
    }

    return data;
  } catch (error) {
    console.error('Faucet status error:', error);
    throw error;
  }
};
