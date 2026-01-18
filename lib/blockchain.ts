import crypto from 'crypto';

// ============================================
// Blockchain & NFT Utility Functions
// ============================================
// For demo/hackathon: We simulate blockchain & NFT operations
// For production: Connect to Polygon via ethers.js with real contracts

export interface HarvestBatchData {
    id: string;
    cropName: string;
    cropVariety?: string;
    plantingDate: string;
    harvestDate?: string;
    quantityKg?: number;
    zoneName?: string;
    farmLocation?: string;
    avgTemperature?: number;
    avgHumidity?: number;
    avgMoisture?: number;
    isOrganic: boolean;
    isPesticideFree: boolean;
    qualityGrade?: string;
}

export interface BlockchainVerification {
    dataHash: string;
    txHash: string;
    blockNumber: number;
    network: string;
    timestamp: string;
    verified: boolean;
}

export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    external_url: string;
    attributes: Array<{
        trait_type: string;
        value: string | number | boolean;
        display_type?: string;
    }>;
}

export interface NFTMintResult {
    tokenId: number;
    contractAddress: string;
    txHash: string;
    blockNumber: number;
    network: string;
    metadataUri: string;
    openSeaUrl: string;
    timestamp: string;
}

/**
 * Generate SHA-256 hash of harvest batch data
 * This creates a unique fingerprint of all the batch information
 */
export function hashBatchData(batch: HarvestBatchData): string {
    const dataString = JSON.stringify({
        id: batch.id,
        cropName: batch.cropName,
        cropVariety: batch.cropVariety,
        plantingDate: batch.plantingDate,
        harvestDate: batch.harvestDate,
        quantityKg: batch.quantityKg,
        zoneName: batch.zoneName,
        farmLocation: batch.farmLocation,
        avgTemperature: batch.avgTemperature,
        avgHumidity: batch.avgHumidity,
        avgMoisture: batch.avgMoisture,
        isOrganic: batch.isOrganic,
        isPesticideFree: batch.isPesticideFree,
        qualityGrade: batch.qualityGrade,
    });

    return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Generate hash for daily sensor data summary
 */
export function hashSensorData(data: {
    date: string;
    recordCount: number;
    avgTemperature: number;
    avgHumidity: number;
    avgMoisture: number;
}): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Generate NFT metadata for a harvest batch
 * This follows the OpenSea metadata standard
 */
export function generateNFTMetadata(
    batch: HarvestBatchData,
    qrCodeId: string,
    baseUrl: string
): NFTMetadata {
    const certifications: string[] = [];
    if (batch.isOrganic) certifications.push('Organic');
    if (batch.isPesticideFree) certifications.push('Pesticide-Free');

    return {
        name: `${batch.cropName} - Batch ${qrCodeId}`,
        description: `Blockchain-verified harvest batch of ${batch.cropName}${batch.cropVariety ? ` (${batch.cropVariety})` : ''} from ${batch.farmLocation || 'Agroflow Farm'}. This NFT certifies the authenticity and complete growing history of this produce batch. Planted on ${batch.plantingDate}${batch.harvestDate ? `, harvested on ${batch.harvestDate}` : ''}.`,
        image: `${baseUrl}/api/nft-image/${qrCodeId}`, // Dynamic image generation
        external_url: `${baseUrl}/verify/${qrCodeId}`,
        attributes: [
            { trait_type: 'Crop', value: batch.cropName },
            { trait_type: 'Variety', value: batch.cropVariety || 'Standard' },
            { trait_type: 'Planting Date', value: batch.plantingDate, display_type: 'date' },
            ...(batch.harvestDate ? [{ trait_type: 'Harvest Date', value: batch.harvestDate, display_type: 'date' }] : []),
            { trait_type: 'Farm Location', value: batch.farmLocation || 'Not specified' },
            { trait_type: 'Zone', value: batch.zoneName || 'Main' },
            ...(batch.quantityKg ? [{ trait_type: 'Quantity (kg)', value: batch.quantityKg, display_type: 'number' }] : []),
            { trait_type: 'Organic', value: batch.isOrganic ? 'Yes' : 'No' },
            { trait_type: 'Pesticide-Free', value: batch.isPesticideFree ? 'Yes' : 'No' },
            ...(batch.qualityGrade ? [{ trait_type: 'Quality Grade', value: batch.qualityGrade }] : []),
            ...(batch.avgTemperature ? [{ trait_type: 'Avg Temperature (°C)', value: batch.avgTemperature, display_type: 'number' }] : []),
            ...(batch.avgHumidity ? [{ trait_type: 'Avg Humidity (%)', value: batch.avgHumidity, display_type: 'number' }] : []),
            ...(batch.avgMoisture ? [{ trait_type: 'Avg Soil Moisture (%)', value: batch.avgMoisture, display_type: 'number' }] : []),
            { trait_type: 'Certifications', value: certifications.join(', ') || 'None' },
            { trait_type: 'Verified By', value: 'Agroflow' },
        ],
    };
}

/**
 * Simulate NFT minting (for demo/hackathon)
 * In production, this would use ethers.js to mint on Polygon
 */
export async function simulateNFTMint(
    batch: HarvestBatchData,
    qrCodeId: string,
    baseUrl: string
): Promise<NFTMintResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock data
    const tokenId = Math.floor(Math.random() * 10000) + 1;
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    const blockNumber = 50000000 + Math.floor(Math.random() * 1000000);

    // In production, this would be the actual contract address
    const contractAddress = '0x' + crypto.randomBytes(20).toString('hex');

    return {
        tokenId,
        contractAddress,
        txHash,
        blockNumber,
        network: 'polygon-amoy',
        metadataUri: `${baseUrl}/api/nft-metadata/${qrCodeId}`,
        openSeaUrl: `https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Simulate blockchain transaction (for demo/hackathon)
 * In production, this would use ethers.js to write to Polygon
 */
export async function simulateBlockchainWrite(dataHash: string): Promise<BlockchainVerification> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock transaction hash (looks realistic)
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    // Generate mock block number (increment from a base)
    const blockNumber = 50000000 + Math.floor(Math.random() * 1000000);

    return {
        dataHash,
        txHash,
        blockNumber,
        network: 'polygon-amoy',
        timestamp: new Date().toISOString(),
        verified: true,
    };
}

/**
 * Verify data integrity by comparing hashes
 */
export function verifyDataIntegrity(
    currentData: HarvestBatchData,
    storedHash: string
): boolean {
    const currentHash = hashBatchData(currentData);
    return currentHash === storedHash;
}

/**
 * Generate Polygon block explorer URL
 */
export function getExplorerUrl(txHash: string, network: string = 'polygon-amoy'): string {
    if (network === 'polygon-mainnet') {
        return `https://polygonscan.com/tx/${txHash}`;
    }
    // Amoy testnet
    return `https://amoy.polygonscan.com/tx/${txHash}`;
}

/**
 * Format hash for display (truncate middle)
 */
export function formatHash(hash: string, startLength: number = 6, endLength: number = 4): string {
    if (hash.length <= startLength + endLength) return hash;
    return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

/**
 * Generate verification URL for QR code
 */
export function generateVerificationUrl(qrCodeId: string, baseUrl: string): string {
    return `${baseUrl}/verify/${qrCodeId}`;
}

/**
 * Get OpenSea URL for an NFT
 */
export function getOpenSeaUrl(contractAddress: string, tokenId: number, network: string = 'polygon-amoy'): string {
    if (network === 'polygon-mainnet') {
        return `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
    }
    return `https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`;
}

// ============================================
// Production Smart Contract Integration (Optional)
// ============================================
// Uncomment and configure for real NFT minting

/*
import { ethers } from 'ethers';

const POLYGON_RPC = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

// ERC-721 ABI for minting
const NFT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export async function mintNFT(
  batch: HarvestBatchData,
  qrCodeId: string,
  recipientAddress: string,
  baseUrl: string
): Promise<NFTMintResult> {
  if (!PRIVATE_KEY || !NFT_CONTRACT_ADDRESS) {
    throw new Error('NFT minting not configured');
  }
  
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, wallet);
  
  // Generate metadata URI
  const metadataUri = `${baseUrl}/api/nft-metadata/${qrCodeId}`;
  
  // Mint NFT
  const tx = await contract.mint(recipientAddress, metadataUri);
  const receipt = await tx.wait();
  
  // Get token ID from Transfer event
  const transferEvent = receipt.logs.find(log => log.topics[0] === ethers.id("Transfer(address,address,uint256)"));
  const tokenId = parseInt(transferEvent.topics[3], 16);
  
  return {
    tokenId,
    contractAddress: NFT_CONTRACT_ADDRESS,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    network: 'polygon-amoy',
    metadataUri,
    openSeaUrl: getOpenSeaUrl(NFT_CONTRACT_ADDRESS, tokenId),
    timestamp: new Date().toISOString(),
  };
}
*/
