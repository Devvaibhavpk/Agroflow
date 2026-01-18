# Smart Contract Deployment Guide

## Network Configuration

### Polygon Amoy Testnet (Recommended for Demo)
- **Chain ID**: 80002
- **RPC URL**: `https://rpc-amoy.polygon.technology`
- **Block Explorer**: `https://amoy.polygonscan.com`
- **Faucet**: https://faucet.polygon.technology/

### Add to MetaMask
1. Open MetaMask → Networks → Add Network
2. Enter:
   - Network Name: `Polygon Amoy Testnet`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC`
   - Explorer: `https://amoy.polygonscan.com`

## Get Test MATIC
1. Go to https://faucet.polygon.technology/
2. Select "Amoy" network
3. Enter your MetaMask wallet address
4. Receive free test MATIC

## Deploy Contract

### Option 1: Remix IDE (Easiest)
1. Go to https://remix.ethereum.org
2. Create new file `AgroflowNFT.sol`
3. Paste the contract code
4. Compile with Solidity 0.8.20
5. Deploy → Injected Provider (MetaMask)
6. Select Polygon Amoy network
7. Deploy and copy contract address

### Option 2: Hardhat (Professional)
```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Initialize Hardhat
npx hardhat init

# Deploy
npx hardhat run scripts/deploy.js --network amoy
```

## Environment Variables
After deployment, add to `.env.local`:
```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x... (your deployed contract)
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
```

## Contract Features
- **mintBatch()**: Mint NFT with QR code ID and data hash
- **getTokenByQrCode()**: Lookup token by QR code
- **verifyIntegrity()**: Verify data hasn't been tampered
- **getBatchInfo()**: Get full batch details
