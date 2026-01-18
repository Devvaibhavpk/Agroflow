/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout,
    Leaf,
    Package,
    QrCode,
    Shield,
    ShieldCheck,
    Calendar,
    MapPin,
    Thermometer,
    Droplets,
    Plus,
    ExternalLink,
    Copy,
    Check,
    Loader2,
    Wheat,
    BadgeCheck,
    Gem
} from 'lucide-react';
import axios from 'axios';
import QRCode from 'qrcode';
import WalletConnect from '@/components/WalletConnect';
import { mintBatchNFT, isMetaMaskInstalled, connectWallet } from '@/lib/wallet';
import { useAuth } from '@/lib/auth';

// Browser-compatible hash function for batch data
async function hashBatchData(batch: {
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
}): Promise<string> {
    const dataString = JSON.stringify(batch);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface HarvestBatch {
    id: string;
    qr_code_id: string;
    crop_name: string;
    crop_variety?: string;
    planting_date: string;
    harvest_date?: string;
    quantity_kg?: number;
    zone_name?: string;
    farm_location?: string;
    avg_temperature?: number;
    avg_humidity?: number;
    avg_moisture?: number;
    is_organic: boolean;
    is_pesticide_free: boolean;
    quality_grade?: string;
    certifications?: string[];
    status: 'growing' | 'harvested' | 'verified' | 'minted' | 'sold';
    blockchain_tx_hash?: string;
    blockchain_block_number?: number;
    blockchain_verified_at?: string;
    blockchain_network?: string;
    data_hash?: string;
    nft_token_id?: number;
    nft_contract_address?: string;
    nft_opensea_url?: string;
    nft_minted_at?: string;
    notes?: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    growing: 'bg-green-100 text-green-700',
    harvested: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-blue-100 text-blue-700',
    minted: 'bg-purple-100 text-purple-700',
    sold: 'bg-gray-100 text-gray-700',
};

const statusIcons: Record<string, typeof Sprout> = {
    growing: Sprout,
    harvested: Package,
    verified: ShieldCheck,
    minted: Gem,
    sold: BadgeCheck,
};

// Demo data for when database is not available
const getDemoBatches = (): HarvestBatch[] => {
    const today = new Date();
    const daysAgo = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - days);
        return d.toISOString(); // Full ISO string for demo
    };
    const deployedContract = "0x8e205B621E7D122C8B1FD2695080A5Ea31280709"; // Actual deployed address

    return [
        {
            id: 'demo-1',
            qr_code_id: 'AF-DEMO01',
            crop_name: 'Organic Tomatoes',
            crop_variety: 'Roma',
            planting_date: daysAgo(90),
            harvest_date: daysAgo(10),
            quantity_kg: 250,
            zone_name: 'Zone A',
            farm_location: 'Chennai, Tamil Nadu',
            avg_temperature: 27.5,
            avg_humidity: 62,
            avg_moisture: 45,
            is_organic: true,
            is_pesticide_free: true,
            quality_grade: 'Premium',
            certifications: ['Organic', 'Pesticide-Free'],
            status: 'verified',
            blockchain_tx_hash: '0xc791b68e0d4f3a2b1c5e9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
            blockchain_block_number: 50042317,
            blockchain_verified_at: daysAgo(5),
            blockchain_network: 'polygon-amoy',
            data_hash: 'abc123def456',
            created_at: daysAgo(90)
        },
        {
            id: 'demo-2',
            qr_code_id: 'AF-DEMO02',
            crop_name: 'Green Spinach',
            crop_variety: 'Baby Leaf',
            planting_date: daysAgo(60),
            harvest_date: daysAgo(15),
            quantity_kg: 80,
            zone_name: 'Zone B',
            farm_location: 'Chennai, Tamil Nadu',
            avg_temperature: 24.2,
            avg_humidity: 68,
            avg_moisture: 52,
            is_organic: true,
            is_pesticide_free: true,
            quality_grade: 'A',
            status: 'minted',
            blockchain_tx_hash: '0x8b90134e7f3c2d1a5b6e9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
            blockchain_block_number: 50045123,
            blockchain_verified_at: daysAgo(10),
            blockchain_network: 'polygon-amoy',
            nft_token_id: 6338,
            nft_contract_address: deployedContract,
            nft_minted_at: daysAgo(10),
            nft_opensea_url: `https://testnets.opensea.io/assets/amoy/${deployedContract}/6338`,
            created_at: daysAgo(60)
        },
        {
            id: 'demo-3',
            qr_code_id: 'AF-DEMO03',
            crop_name: 'Red Chili',
            crop_variety: 'Guntur',
            planting_date: daysAgo(30),
            quantity_kg: 0,
            zone_name: 'Zone C',
            farm_location: 'Chennai, Tamil Nadu',
            avg_temperature: 29.1,
            avg_humidity: 55,
            avg_moisture: 40,
            is_organic: false,
            is_pesticide_free: false,
            status: 'growing',
            created_at: daysAgo(30)
        }
    ];
};

const DEMO_BATCHES = getDemoBatches();

export default function TraceabilityPage() {
    // Auth check - requires login
    const { user, loading: authLoading } = useAuth(true);

    const [batches, setBatches] = useState<HarvestBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [verifying, setVerifying] = useState(false);
    const [minting, setMinting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state - with today's date as default
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        cropName: '',
        cropVariety: '',
        plantingDate: getTodayDate(),
        zoneName: '',
        farmLocation: 'Chennai, Tamil Nadu',
        isOrganic: false,
        isPesticideFree: false,
    });
    const [creating, setCreating] = useState(false);

    // Fetch batches
    useEffect(() => {
        if (user) {
            fetchBatches();
        }
    }, [user]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
                    <p className="text-gray-500">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, useAuth will redirect to login
    if (!user) {
        return null;
    }

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/api/harvest');
            setBatches(response.data.batches || []);
        } catch (error) {
            console.log('Using demo data:', error);
            setBatches(DEMO_BATCHES);
        } finally {
            setLoading(false);
        }
    };

    // Generate QR code
    const generateQRCode = async (batch: HarvestBatch) => {
        const verifyUrl = `${window.location.origin}/verify/${batch.qr_code_id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#1a5f2a',
                light: '#ffffff',
            },
        });
        setQrCodeUrl(qrDataUrl);
        setSelectedBatch(batch);
    };

    // Verify batch on blockchain
    const verifyOnBlockchain = async (batchId: string) => {
        setVerifying(true);
        try {
            const response = await axios.put('/api/harvest', {
                id: batchId,
                verify: true,
            });

            // Update local state
            setBatches(prev => prev.map(b =>
                b.id === batchId ? response.data.batch : b
            ));

            if (selectedBatch?.id === batchId) {
                setSelectedBatch(response.data.batch);
            }
        } catch (error) {
            console.error('Verification failed:', error);
            // Demo: simulate verification with consistent data (not random)
            // This hash is for demo purposes only - real on-chain data comes from NFT minting
            const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x8e205B621E7D122C8B1FD2695080A5Ea31280709';
            setBatches(prev => prev.map(b =>
                b.id === batchId ? {
                    ...b,
                    status: 'verified' as const,
                    // Use simulated but consistent data for demo
                    blockchain_tx_hash: '0x' + 'demo'.repeat(16), // Clearly fake for demo
                    blockchain_block_number: 50000000,
                    blockchain_verified_at: new Date().toISOString(),
                    blockchain_network: 'polygon-amoy',
                    nft_contract_address: contractAddress,
                } : b
            ));
        } finally {
            setVerifying(false);
        }
    };

    // Mint batch as NFT using real MetaMask
    const mintAsNFT = async (batchId: string) => {
        setMinting(true);

        // Get the batch to mint
        const batch = batches.find(b => b.id === batchId);
        if (!batch) {
            setMinting(false);
            return;
        }

        try {
            // Check if MetaMask is installed
            if (!isMetaMaskInstalled()) {
                alert('Please install MetaMask to mint NFTs on the blockchain!');
                setMinting(false);
                return;
            }

            // Connect wallet if needed
            await connectWallet();

            // Get contract address
            const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x8e205B621E7D122C8B1FD2695080A5Ea31280709';

            // Prepare batch data for hashing
            const batchData = {
                id: batch.id,
                cropName: batch.crop_name,
                cropVariety: batch.crop_variety,
                plantingDate: batch.planting_date,
                harvestDate: batch.harvest_date,
                quantityKg: batch.quantity_kg,
                zoneName: batch.zone_name,
                farmLocation: batch.farm_location,
                avgTemperature: batch.avg_temperature,
                avgHumidity: batch.avg_humidity,
                avgMoisture: batch.avg_moisture,
                isOrganic: batch.is_organic,
                isPesticideFree: batch.is_pesticide_free,
                qualityGrade: batch.quality_grade,
            };

            // Generate data hash
            const dataHash = await hashBatchData(batchData);

            // Generate metadata URI
            const baseUrl = window.location.origin;
            const metadataUri = `${baseUrl}/api/nft-metadata/${batch.qr_code_id}`;

            // REAL BLOCKCHAIN MINTING via MetaMask
            const result = await mintBatchNFT(
                contractAddress,
                batch.qr_code_id,
                dataHash,
                metadataUri
            );

            if (result.success) {
                // Update database with real blockchain data
                console.log('💾 Saving to database:', {
                    batchId,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    tokenId: result.tokenId
                });

                await axios.put('/api/harvest', {
                    id: batchId,
                    status: 'minted',
                    blockchain_tx_hash: result.txHash,
                    blockchain_block_number: result.blockNumber,
                    nft_token_id: result.tokenId,
                    nft_contract_address: contractAddress,
                    nft_opensea_url: `https://amoy.polygonscan.com/nft/${contractAddress}/${result.tokenId}`,
                });

                // Update local state with real data
                const updatedBatch = {
                    ...batch,
                    status: 'minted' as const,
                    blockchain_tx_hash: result.txHash,
                    blockchain_block_number: result.blockNumber,
                    blockchain_verified_at: new Date().toISOString(),
                    blockchain_network: 'polygon-amoy',
                    nft_token_id: result.tokenId,
                    nft_contract_address: contractAddress,
                    nft_opensea_url: `https://amoy.polygonscan.com/nft/${contractAddress}/${result.tokenId}`,
                    nft_minted_at: new Date().toISOString(),
                };

                setBatches(prev => prev.map(b =>
                    b.id === batchId ? updatedBatch : b
                ));

                setSelectedBatch(updatedBatch);

                console.log('✅ Updated batch with real tx hash:', result.txHash);

                alert(`NFT Minted Successfully!\nToken ID: #${result.tokenId}\nTx Hash: ${result.txHash}\n\nView on PolygonScan:\nhttps://amoy.polygonscan.com/tx/${result.txHash}`);
            } else {
                throw new Error(result.error || 'Minting failed');
            }
        } catch (error) {
            console.error('Minting failed:', error);
            alert(`Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        } finally {
            setMinting(false);
        }
    };

    // Create new batch
    const createBatch = async () => {
        if (!formData.cropName || !formData.plantingDate) return;

        setCreating(true);
        try {
            const response = await axios.post('/api/harvest', formData);
            setBatches(prev => [response.data.batch, ...prev]);
            setShowCreateForm(false);
            setFormData({
                cropName: '',
                cropVariety: '',
                plantingDate: '',
                zoneName: '',
                farmLocation: 'Chennai, Tamil Nadu',
                isOrganic: false,
                isPesticideFree: false,
            });
        } catch (error) {
            console.error('Failed to create batch:', error);
            // Demo: add locally
            const newBatch: HarvestBatch = {
                id: 'new-' + Date.now(),
                qr_code_id: 'AF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                crop_name: formData.cropName,
                crop_variety: formData.cropVariety,
                planting_date: formData.plantingDate,
                zone_name: formData.zoneName,
                farm_location: formData.farmLocation,
                is_organic: formData.isOrganic,
                is_pesticide_free: formData.isPesticideFree,
                status: 'growing',
                created_at: new Date().toISOString(),
            };
            setBatches(prev => [newBatch, ...prev]);
            setShowCreateForm(false);
        } finally {
            setCreating(false);
        }
    };

    // Copy verification link
    const copyVerificationLink = async () => {
        if (!selectedBatch) return;
        const link = `${window.location.origin}/verify/${selectedBatch.qr_code_id}`;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter batches
    const filteredBatches = activeTab === 'all'
        ? batches
        : batches.filter(b => b.status === activeTab);

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading traceability data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-green-600" />
                        Crop Traceability
                    </h1>
                    <p className="text-gray-500">Blockchain-verified NFT certificates & QR stickers</p>
                </div>
                <div className="flex items-center gap-3">
                    <WalletConnect />
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Crop Batch
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <Sprout className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{batches.filter(b => b.status === 'growing').length}</p>
                                <p className="text-sm text-gray-500">Growing</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{batches.filter(b => b.status === 'harvested').length}</p>
                                <p className="text-sm text-gray-500">Harvested</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{batches.filter(b => b.status === 'verified').length}</p>
                                <p className="text-sm text-gray-500">Verified</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{batches.length}</p>
                                <p className="text-sm text-gray-500">Total Batches</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Batches List */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Wheat className="w-5 h-5 text-green-600" />
                                Harvest Batches
                            </CardTitle>
                            <CardDescription>Track and verify your crop batches</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="mb-4 bg-gray-100">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="growing">Growing</TabsTrigger>
                                    <TabsTrigger value="harvested">Harvested</TabsTrigger>
                                    <TabsTrigger value="verified">Verified</TabsTrigger>
                                </TabsList>

                                <TabsContent value={activeTab} className="space-y-3">
                                    <AnimatePresence>
                                        {filteredBatches.map((batch, index) => {
                                            const StatusIcon = statusIcons[batch.status];
                                            return (
                                                <motion.div
                                                    key={batch.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => generateQRCode(batch)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedBatch?.id === batch.id
                                                        ? 'border-green-500 bg-green-50/50'
                                                        : 'border-gray-100 hover:border-green-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${batch.is_organic ? 'bg-green-100' : 'bg-gray-100'
                                                                }`}>
                                                                <Leaf className={`w-6 h-6 ${batch.is_organic ? 'text-green-600' : 'text-gray-500'}`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{batch.crop_name}</h3>
                                                                {batch.crop_variety && (
                                                                    <p className="text-sm text-gray-500">{batch.crop_variety}</p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>Planted: {formatDate(batch.planting_date)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <Badge className={statusColors[batch.status]}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                                                            </Badge>
                                                            {batch.is_organic && (
                                                                <Badge variant="outline" className="text-green-600 border-green-300">
                                                                    🌿 Organic
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {batch.blockchain_tx_hash && (
                                                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-blue-600">
                                                            <ShieldCheck className="w-4 h-4" />
                                                            <span>Blockchain Verified</span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="font-mono">{batch.qr_code_id}</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    {filteredBatches.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No batches found</p>
                                            <Button
                                                variant="link"
                                                onClick={() => setShowCreateForm(true)}
                                                className="text-green-600"
                                            >
                                                Create your first batch
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code & Details Panel */}
                <div className="space-y-4">
                    {selectedBatch ? (
                        <>
                            {/* QR Code Card */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-2 text-center">
                                    <CardTitle className="text-lg">QR Sticker</CardTitle>
                                    <CardDescription>Scan to verify authenticity</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    {qrCodeUrl && (
                                        <div className="bg-white p-4 rounded-xl inline-block shadow-inner border">
                                            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                            <p className="font-mono text-lg font-bold text-green-700 mt-2">
                                                {selectedBatch.qr_code_id}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-center mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyVerificationLink}
                                            className="gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/verify/${selectedBatch.qr_code_id}`, '_blank')}
                                            className="gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Preview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Batch Details */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        Batch Details
                                        {!selectedBatch.blockchain_tx_hash && (
                                            <Button
                                                size="sm"
                                                onClick={() => verifyOnBlockchain(selectedBatch.id)}
                                                disabled={verifying}
                                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                                            >
                                                {verifying ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Shield className="w-4 h-4" />
                                                )}
                                                Verify
                                            </Button>
                                        )}
                                        {selectedBatch.blockchain_tx_hash && selectedBatch.status !== 'minted' && (!selectedBatch.nft_token_id || selectedBatch.nft_token_id === 0) && (
                                            <Button
                                                size="sm"
                                                onClick={() => mintAsNFT(selectedBatch.id)}
                                                disabled={minting}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                                            >
                                                {minting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Gem className="w-4 h-4" />
                                                )}
                                                Mint NFT
                                            </Button>
                                        )}
                                        {selectedBatch.nft_token_id && selectedBatch.nft_token_id > 0 && (
                                            <Badge className="bg-purple-100 text-purple-700 gap-1">
                                                <Gem className="w-3 h-3" />
                                                NFT #{selectedBatch.nft_token_id}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Crop</p>
                                            <p className="font-medium">{selectedBatch.crop_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Variety</p>
                                            <p className="font-medium">{selectedBatch.crop_variety || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Planted</p>
                                            <p className="font-medium">{formatDate(selectedBatch.planting_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Harvested</p>
                                            <p className="font-medium">{formatDate(selectedBatch.harvest_date)}</p>
                                        </div>
                                        {selectedBatch.quantity_kg && (
                                            <div>
                                                <p className="text-gray-500">Quantity</p>
                                                <p className="font-medium">{selectedBatch.quantity_kg} kg</p>
                                            </div>
                                        )}
                                        {selectedBatch.quality_grade && (
                                            <div>
                                                <p className="text-gray-500">Grade</p>
                                                <p className="font-medium">{selectedBatch.quality_grade}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Growing Conditions */}
                                    {(selectedBatch.avg_temperature || selectedBatch.avg_humidity || selectedBatch.avg_moisture) && (
                                        <div className="pt-3 border-t">
                                            <p className="text-sm font-medium mb-2">Growing Conditions</p>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 bg-red-50 rounded-lg">
                                                    <Thermometer className="w-4 h-4 text-red-500 mx-auto" />
                                                    <p className="text-xs text-gray-500 mt-1">Avg Temp</p>
                                                    <p className="font-medium text-sm">{selectedBatch.avg_temperature}°C</p>
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <Droplets className="w-4 h-4 text-blue-500 mx-auto" />
                                                    <p className="text-xs text-gray-500 mt-1">Humidity</p>
                                                    <p className="font-medium text-sm">{selectedBatch.avg_humidity}%</p>
                                                </div>
                                                <div className="p-2 bg-green-50 rounded-lg">
                                                    <Leaf className="w-4 h-4 text-green-500 mx-auto" />
                                                    <p className="text-xs text-gray-500 mt-1">Moisture</p>
                                                    <p className="font-medium text-sm">{selectedBatch.avg_moisture}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Blockchain Verification */}
                                    {selectedBatch.blockchain_tx_hash && (
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                                <ShieldCheck className="w-5 h-5" />
                                                <span className="font-medium">Blockchain Verified</span>
                                                {selectedBatch.status !== 'minted' && (
                                                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">Demo</Badge>
                                                )}
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg text-xs space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Network</span>
                                                    <span className="font-medium">Polygon Amoy</span>
                                                </div>
                                                {selectedBatch.blockchain_block_number && selectedBatch.blockchain_block_number !== 50000000 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Block</span>
                                                        <span className="font-mono">{selectedBatch.blockchain_block_number}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Tx Hash</span>
                                                    {/* Only show clickable link for minted batches (real tx) */}
                                                    {selectedBatch.status === 'minted' && selectedBatch.blockchain_tx_hash && !selectedBatch.blockchain_tx_hash.includes('demo') ? (
                                                        <a
                                                            href={`https://amoy.polygonscan.com/tx/${selectedBatch.blockchain_tx_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            {selectedBatch.blockchain_tx_hash?.slice(0, 10)}...
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="font-mono text-gray-400">
                                                            {selectedBatch.status === 'minted' ? selectedBatch.blockchain_tx_hash?.slice(0, 10) + '...' : 'Mint to get real Tx'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* NFT Certificate */}
                                    {(selectedBatch.nft_token_id || selectedBatch.status === 'minted') && (
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                                                <Gem className="w-5 h-5" />
                                                <span className="font-medium">NFT Certificate</span>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg text-xs space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Token ID</span>
                                                    <span className="font-bold text-purple-700">#{selectedBatch.nft_token_id || 1}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Contract</span>
                                                    <span className="font-mono text-xs">
                                                        {(selectedBatch.nft_contract_address || '0x8e205B621E7D122C8B1FD2695080A5Ea31280709').slice(0, 8)}...{(selectedBatch.nft_contract_address || '0x8e205B621E7D122C8B1FD2695080A5Ea31280709').slice(-4)}
                                                    </span>
                                                </div>
                                                {/* View on PolygonScan (OpenSea doesn't support testnets) */}
                                                <a
                                                    href={`https://amoy.polygonscan.com/nft/${selectedBatch.nft_contract_address || '0x8e205B621E7D122C8B1FD2695080A5Ea31280709'}/${selectedBatch.nft_token_id || 1}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full mt-2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View on PolygonScan
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {selectedBatch.farm_location && (
                                        <div className="pt-3 border-t flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{selectedBatch.farm_location}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Select a batch to view QR code</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Batch Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Sprout className="w-6 h-6 text-green-600" />
                                New Crop Batch
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Crop Name *</label>
                                    <Input
                                        placeholder="e.g., Tomatoes, Spinach"
                                        value={formData.cropName}
                                        onChange={e => setFormData(prev => ({ ...prev, cropName: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Variety</label>
                                    <Input
                                        placeholder="e.g., Roma, Cherry"
                                        value={formData.cropVariety}
                                        onChange={e => setFormData(prev => ({ ...prev, cropVariety: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Planting Date *</label>
                                    <Input
                                        type="date"
                                        value={formData.plantingDate}
                                        onChange={e => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Zone/Area</label>
                                    <Input
                                        placeholder="e.g., Zone A, Field 1"
                                        value={formData.zoneName}
                                        onChange={e => setFormData(prev => ({ ...prev, zoneName: e.target.value }))}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isOrganic}
                                            onChange={e => setFormData(prev => ({ ...prev, isOrganic: e.target.checked }))}
                                            className="w-4 h-4 text-green-600 rounded"
                                        />
                                        <span className="text-sm">Organic</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPesticideFree}
                                            onChange={e => setFormData(prev => ({ ...prev, isPesticideFree: e.target.checked }))}
                                            className="w-4 h-4 text-green-600 rounded"
                                        />
                                        <span className="text-sm">Pesticide-Free</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={createBatch}
                                        disabled={creating || !formData.cropName || !formData.plantingDate}
                                    >
                                        {creating ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                        )}
                                        Create Batch
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
