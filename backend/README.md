# ChainLock Faucet Backend

This is the backend service for ChainLock's automatic MATIC funder on Polygon Amoy testnet.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
PORT=3001
FAUCET_PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc-amoy.polygon.technology
CORS_ORIGIN=http://localhost:5173
```

3. Fund your faucet wallet:
   - Get the address from your private key
   - Visit https://faucet.polygon.technology/
   - Request test MATIC for your faucet wallet

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### POST /api/fund
Fund a wallet with 1 MATIC.

Request body:
```json
{
  "address": "0x..."
}
```

### GET /api/status
Get faucet status including balance and number of funded addresses.

## Security Features

- Rate limiting: 3 requests per IP per day
- Address tracking to prevent multiple funding
- Balance checks
- CORS protection
- Input validation
