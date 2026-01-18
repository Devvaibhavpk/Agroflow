# AgroflowNFT Smart Contract Deployment

Complete guide to deploy the AgroflowNFT smart contract to Polygon Amoy testnet using Hardhat.

## Prerequisites

- Node.js 18+
- MetaMask wallet with test MATIC
- Private key for deployment

## Quick Start

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Create .env file with your private key
echo "PRIVATE_KEY=your_private_key_here" > .env

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy.js --network amoy
```

---

## Step-by-Step Setup

### 1. Get Test MATIC

1. Go to https://faucet.polygon.technology/
2. Select **Polygon Amoy** network
3. Enter your MetaMask wallet address
4. Click "Submit" and wait for tokens

### 2. Export Private Key from MetaMask

1. Open MetaMask → Account → ⋮ menu → Account Details
2. Click "Show Private Key"
3. Enter password and copy key
4. **Never share this key!**

### 3. Create Environment File

Create `contracts/.env`:
```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
```

### 4. Deploy Contract

```bash
cd contracts
npx hardhat run scripts/deploy.js --network amoy
```

Expected output:
```
Deploying AgroflowNFT...
AgroflowNFT deployed to: 0x1234...5678
Verify at: https://amoy.polygonscan.com/address/0x1234...5678
```

### 5. Update Frontend

Add to your project's `.env.local`:
```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x... (paste deployed address)
```

---

## Network Details

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Polygon Amoy | 80002 | https://rpc-amoy.polygon.technology | https://amoy.polygonscan.com |
| Polygon Mainnet | 137 | https://polygon-rpc.com | https://polygonscan.com |

---

## Add Polygon Amoy to MetaMask

1. Open MetaMask → Networks → "Add Network"
2. Select "Add a network manually"
3. Enter:
   - **Network Name**: Polygon Amoy Testnet
   - **RPC URL**: https://rpc-amoy.polygon.technology
   - **Chain ID**: 80002
   - **Currency Symbol**: MATIC
   - **Block Explorer**: https://amoy.polygonscan.com

---

## Contract Functions

| Function | Description |
|----------|-------------|
| `mintBatch(to, qrCodeId, dataHash, uri)` | Mint NFT for harvest batch |
| `getTokenByQrCode(qrCodeId)` | Get token ID from QR code |
| `verifyIntegrity(tokenId, dataHash)` | Verify data hasn't changed |
| `getBatchInfo(tokenId)` | Get batch owner and data hash |

---

## Verify Contract (Optional)

```bash
npx hardhat verify --network amoy DEPLOYED_CONTRACT_ADDRESS
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Get test MATIC from faucet |
| "Invalid private key" | Remove 0x prefix from key |
| "Network not found" | Check hardhat.config.js |
| "Nonce too low" | Reset MetaMask account nonce |
