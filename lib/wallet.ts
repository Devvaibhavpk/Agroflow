import { ethers } from 'ethers';

// Contract ABI (simplified - full ABI generated after compilation)
const AGROFLOW_NFT_ABI = [
    "function mintBatch(address to, string memory qrCodeId, bytes32 dataHash, string memory uri) public returns (uint256)",
    "function getTokenByQrCode(string memory qrCodeId) public view returns (uint256)",
    "function verifyIntegrity(uint256 tokenId, bytes32 dataHash) public view returns (bool)",
    "function getBatchInfo(uint256 tokenId) public view returns (address owner, string memory qrCodeId, bytes32 dataHash, string memory uri)",
    "function totalSupply() public view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "event BatchMinted(uint256 indexed tokenId, address indexed owner, string qrCodeId, bytes32 dataHash, string tokenURI)",
    "event BatchTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string qrCodeId)"
];

// Network configuration
export const NETWORKS = {
    'polygon-amoy': {
        chainId: '0x13882', // 80002 in hex
        chainName: 'Polygon Amoy Testnet',
        rpcUrls: ['https://rpc-amoy.polygon.technology'],
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        blockExplorerUrls: ['https://amoy.polygonscan.com']
    },
    'polygon-mainnet': {
        chainId: '0x89', // 137 in hex
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        blockExplorerUrls: ['https://polygonscan.com']
    }
};

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: string | null;
    balance: string | null;
}

export interface MintResult {
    success: boolean;
    tokenId?: number;
    txHash?: string;
    blockNumber?: number;
    error?: string;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<WalletState> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        }) as string[];

        const chainId = await window.ethereum.request({
            method: 'eth_chainId'
        }) as string;

        // Get balance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);

        return {
            isConnected: true,
            address: accounts[0],
            chainId: chainId,
            balance: ethers.formatEther(balance)
        };
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
}

/**
 * Switch to Polygon Amoy network
 */
export async function switchToPolygonAmoy(): Promise<boolean> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
    }

    const network = NETWORKS['polygon-amoy'];

    try {
        // Try to switch to the network
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.chainId }]
        });
        return true;
    } catch (switchError: unknown) {
        // If network doesn't exist, add it
        if ((switchError as { code?: number }).code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [network]
                });
                return true;
            } catch (addError) {
                console.error('Failed to add network:', addError);
                throw addError;
            }
        }
        throw switchError;
    }
}

/**
 * Get the NFT contract instance
 */
export function getContract(contractAddress: string, signer?: ethers.Signer): ethers.Contract {
    if (!contractAddress) {
        throw new Error('Contract address not configured');
    }

    if (signer) {
        return new ethers.Contract(contractAddress, AGROFLOW_NFT_ABI, signer);
    }

    // Read-only provider
    const provider = new ethers.JsonRpcProvider(NETWORKS['polygon-amoy'].rpcUrls[0]);
    return new ethers.Contract(contractAddress, AGROFLOW_NFT_ABI, provider);
}

/**
 * Mint a harvest batch as NFT
 */
export async function mintBatchNFT(
    contractAddress: string,
    qrCodeId: string,
    dataHash: string,
    metadataUri: string
): Promise<MintResult> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
    }

    try {
        // Ensure on correct network
        await switchToPolygonAmoy();

        // Get signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = getContract(contractAddress, signer);

        // Convert data hash to bytes32
        // The hash is already a 64-char hex string from SHA-256, just ensure proper format
        let hashHex = dataHash.startsWith('0x') ? dataHash : '0x' + dataHash;
        // Ensure it's exactly 66 chars (0x + 64 hex chars = 32 bytes)
        if (hashHex.length < 66) {
            hashHex = '0x' + hashHex.slice(2).padStart(64, '0');
        } else if (hashHex.length > 66) {
            hashHex = '0x' + hashHex.slice(2, 66);
        }
        const hashBytes = hashHex;

        // Debug logging
        console.log('🚀 Minting NFT with params:', {
            to: await signer.getAddress(),
            qrCodeId,
            hashBytes,
            metadataUri,
            contractAddress
        });

        // Check if QR code already minted
        try {
            const existingTokenId = await contract.getTokenByQrCode(qrCodeId);
            if (existingTokenId && Number(existingTokenId) > 0) {
                return {
                    success: false,
                    error: `This QR code (${qrCodeId}) was already minted as NFT #${existingTokenId}`
                };
            }
        } catch {
            // Function may revert if not found, which is fine
        }

        // Check balance before minting
        const balance = await provider.getBalance(await signer.getAddress());
        const balanceInMatic = Number(ethers.formatEther(balance));
        console.log('💰 Wallet balance:', balanceInMatic, 'MATIC');

        if (balanceInMatic < 0.005) {
            return {
                success: false,
                error: `Insufficient MATIC (${balanceInMatic.toFixed(4)} MATIC). Need at least 0.005 MATIC. Get more from faucet.polygon.technology`
            };
        }

        // Get current gas price and add buffer
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ? feeData.gasPrice * BigInt(2) : ethers.parseUnits('30', 'gwei');
        console.log('⛽ Gas price:', ethers.formatUnits(gasPrice, 'gwei'), 'Gwei');

        // Mint the NFT with explicit gas settings to avoid estimation issues
        console.log('📝 Sending mint transaction...');
        const tx = await contract.mintBatch(
            await signer.getAddress(),
            qrCodeId,
            hashBytes,
            metadataUri,
            {
                gasLimit: 300000, // Explicit gas limit
                gasPrice: gasPrice, // Explicit gas price
            }
        );

        // Wait for confirmation
        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed!', receipt.hash);

        // Parse the BatchMinted event to get tokenId
        let tokenId = 0;

        // Try to get tokenId from event logs
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed?.name === 'BatchMinted') {
                    tokenId = Number(parsed.args[0]);
                    console.log('📦 Token ID from event:', tokenId);
                    break;
                }
            } catch {
                // Not our event, continue
            }
        }

        // Fallback: get totalSupply as tokenId (latest minted)
        if (tokenId === 0) {
            try {
                const total = await contract.totalSupply();
                tokenId = Number(total);
                console.log('📦 Token ID from totalSupply:', tokenId);
            } catch (e) {
                console.warn('Could not get totalSupply:', e);
                tokenId = 1; // Default fallback
            }
        }

        return {
            success: true,
            tokenId,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Mint failed:', error);

        // Parse common error messages
        let errorMessage = 'Minting failed';
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('qr code already minted') || msg.includes('already minted')) {
                errorMessage = 'This batch has already been minted as an NFT';
            } else if (msg.includes('insufficient funds')) {
                errorMessage = 'Insufficient MATIC for gas. Get test MATIC from faucet.polygon.technology';
            } else if (msg.includes('user rejected') || msg.includes('denied')) {
                errorMessage = 'Transaction rejected by user';
            } else if (msg.includes('internal json-rpc error') || msg.includes('execution reverted')) {
                // Try to extract revert reason
                const revertMatch = error.message.match(/reason="([^"]+)"/);
                if (revertMatch) {
                    errorMessage = revertMatch[1];
                } else {
                    errorMessage = 'Transaction failed. This QR code may already be minted, or there may be a network issue. Try again.';
                }
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Get batch info from contract
 */
export async function getBatchFromContract(
    contractAddress: string,
    tokenId: number
): Promise<{
    owner: string;
    qrCodeId: string;
    dataHash: string;
    uri: string;
} | null> {
    try {
        const contract = getContract(contractAddress);
        const [owner, qrCodeId, dataHash, uri] = await contract.getBatchInfo(tokenId);
        return { owner, qrCodeId, dataHash, uri };
    } catch (error) {
        console.error('Failed to get batch info:', error);
        return null;
    }
}

/**
 * Verify batch by QR code
 */
export async function verifyBatchByQrCode(
    contractAddress: string,
    qrCodeId: string
): Promise<{ exists: boolean; tokenId?: number; owner?: string }> {
    try {
        const contract = getContract(contractAddress);
        const tokenId = await contract.getTokenByQrCode(qrCodeId);

        if (tokenId === BigInt(0)) {
            return { exists: false };
        }

        const owner = await contract.ownerOf(tokenId);
        return {
            exists: true,
            tokenId: Number(tokenId),
            owner
        };
    } catch (error) {
        console.error('Verification failed:', error);
        return { exists: false };
    }
}

/**
 * Listen for wallet events
 */
export function setupWalletListeners(
    onAccountChange: (accounts: string[]) => void,
    onChainChange: (chainId: string) => void
): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    const handleAccountChange = (args: unknown) => {
        const accounts = args as string[];
        onAccountChange(accounts);
    };

    const handleChainChange = (args: unknown) => {
        const chainId = args as string;
        onChainChange(chainId);
    };

    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('chainChanged', handleChainChange);

    // Return cleanup function
    return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
        window.ethereum.removeListener('chainChanged', handleChainChange);
    };
}

/**
 * Get explorer URL for transaction
 */
export function getTransactionUrl(txHash: string, network: string = 'polygon-amoy'): string {
    const explorerBase = network === 'polygon-mainnet'
        ? 'https://polygonscan.com'
        : 'https://amoy.polygonscan.com';
    return `${explorerBase}/tx/${txHash}`;
}

/**
 * Get OpenSea URL for NFT
 */
export function getOpenSeaUrl(contractAddress: string, tokenId: number, network: string = 'polygon-amoy'): string {
    if (network === 'polygon-mainnet') {
        return `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
    }
    return `https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`;
}

// Type declaration for window.ethereum
declare global {
    interface Window {
        ethereum: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}
