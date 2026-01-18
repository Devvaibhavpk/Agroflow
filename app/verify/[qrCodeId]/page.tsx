/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, use } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    ShieldX,
    Leaf,
    Calendar,
    MapPin,
    Thermometer,
    Droplets,
    Package,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    Sprout,
    Clock,
    Award,
    Link2
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface BatchData {
    qrCodeId: string;
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
    certifications?: string[];
    status: string;
}

interface Verification {
    verified: boolean;
    integrityValid: boolean;
    dataHash?: string;
    txHash?: string;
    blockNumber?: number;
    network?: string;
    explorerUrl?: string;
    verifiedAt?: string;
}

export default function VerifyPage({ params }: { params: Promise<{ qrCodeId: string }> }) {
    const resolvedParams = use(params);
    const [loading, setLoading] = useState(true);
    const [batch, setBatch] = useState<BatchData | null>(null);
    const [verification, setVerification] = useState<Verification | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        verifyBatch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams.qrCodeId]);

    const verifyBatch = async () => {
        try {
            const response = await axios.get(`/api/verify?qr_code_id=${resolvedParams.qrCodeId}`);
            setBatch(response.data.batch);
            setVerification(response.data.verification);
        } catch (err) {
            console.error('Verification failed:', err);
            // Demo fallback
            if (resolvedParams.qrCodeId.startsWith('AF-DEMO')) {
                setBatch({
                    qrCodeId: resolvedParams.qrCodeId,
                    cropName: 'Organic Tomatoes',
                    cropVariety: 'Roma',
                    plantingDate: '2024-10-15',
                    harvestDate: '2024-12-20',
                    quantityKg: 250,
                    zoneName: 'Zone A',
                    farmLocation: 'Bangalore, Karnataka',
                    avgTemperature: 27.5,
                    avgHumidity: 62,
                    avgMoisture: 45,
                    isOrganic: true,
                    isPesticideFree: true,
                    qualityGrade: 'Premium',
                    certifications: ['Organic', 'Pesticide-Free'],
                    status: 'verified',
                });
                setVerification({
                    verified: true,
                    integrityValid: true,
                    dataHash: 'a1b2c3...f4e5',
                    txHash: '0x1234...abcd',
                    blockNumber: 50123456,
                    network: 'polygon-amoy',
                    explorerUrl: 'https://amoy.polygonscan.com/tx/0x1234567890',
                    verifiedAt: '2024-12-21T10:30:00Z',
                });
            } else {
                setError('Product not found. Please check the QR code and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysSincePlanting = () => {
        if (!batch?.plantingDate) return 0;
        const plantDate = new Date(batch.plantingDate);
        const endDate = batch.harvestDate ? new Date(batch.harvestDate) : new Date();
        return Math.floor((endDate.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Verifying product authenticity...</p>
                </div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
                <Card className="max-w-md w-full border-0 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                        <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
                        <Link href="/">
                            <Button className="bg-green-600 hover:bg-green-700">
                                Go to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isVerified = verification?.verified;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 pb-20">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto pt-8"
            >
                {/* Verification Status */}
                <Card className={`border-0 shadow-2xl overflow-hidden ${isVerified ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-yellow-500 to-orange-500'}`}>
                    <CardContent className="p-6 text-center text-white">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            {isVerified ? (
                                <ShieldCheck className="w-12 h-12" />
                            ) : (
                                <ShieldX className="w-12 h-12" />
                            )}
                        </motion.div>
                        <h1 className="text-2xl font-bold mb-1">
                            {isVerified ? 'Authenticity Verified' : 'Pending Verification'}
                        </h1>
                        <p className="text-white/80">
                            {isVerified
                                ? 'This product is blockchain-verified'
                                : 'This product has not been verified on blockchain yet'}
                        </p>

                        {/* Certifications */}
                        <div className="flex justify-center gap-2 mt-4">
                            {batch.isOrganic && (
                                <Badge className="bg-white/20 text-white border-0">
                                    🌿 Organic
                                </Badge>
                            )}
                            {batch.isPesticideFree && (
                                <Badge className="bg-white/20 text-white border-0">
                                    ✓ Pesticide-Free
                                </Badge>
                            )}
                            {batch.qualityGrade && (
                                <Badge className="bg-white/20 text-white border-0">
                                    ⭐ Grade {batch.qualityGrade}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-0 shadow-xl mt-4">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Leaf className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{batch.cropName}</h2>
                                    {batch.cropVariety && (
                                        <p className="text-gray-500">{batch.cropVariety} Variety</p>
                                    )}
                                    <p className="text-sm text-gray-400 font-mono mt-1">{batch.qrCodeId}</p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="relative pl-8 mb-6">
                                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-green-200"></div>

                                <div className="relative mb-4">
                                    <div className="absolute -left-5 w-4 h-4 bg-green-500 rounded-full border-4 border-green-100"></div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sprout className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Planted</span>
                                    </div>
                                    <p className="text-gray-600">{formatDate(batch.plantingDate)}</p>
                                </div>

                                {batch.harvestDate && (
                                    <div className="relative mb-4">
                                        <div className="absolute -left-5 w-4 h-4 bg-yellow-500 rounded-full border-4 border-yellow-100"></div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Package className="w-4 h-4 text-yellow-600" />
                                            <span className="font-medium">Harvested</span>
                                        </div>
                                        <p className="text-gray-600">{formatDate(batch.harvestDate)}</p>
                                    </div>
                                )}

                                {isVerified && verification?.verifiedAt && (
                                    <div className="relative">
                                        <div className="absolute -left-5 w-4 h-4 bg-blue-500 rounded-full border-4 border-blue-100"></div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium">Verified</span>
                                        </div>
                                        <p className="text-gray-600">{formatDate(verification.verifiedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Time Badge */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">
                                    <strong>{getDaysSincePlanting()}</strong> days from planting to harvest
                                </span>
                            </div>

                            {/* Growing Conditions */}
                            {(batch.avgTemperature || batch.avgHumidity || batch.avgMoisture) && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Growing Conditions
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="bg-red-50 rounded-xl p-3">
                                            <Thermometer className="w-5 h-5 text-red-500 mx-auto" />
                                            <p className="text-lg font-bold text-gray-900 mt-1">{batch.avgTemperature}°C</p>
                                            <p className="text-xs text-gray-500">Avg Temp</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-3">
                                            <Droplets className="w-5 h-5 text-blue-500 mx-auto" />
                                            <p className="text-lg font-bold text-gray-900 mt-1">{batch.avgHumidity}%</p>
                                            <p className="text-xs text-gray-500">Humidity</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-3">
                                            <Leaf className="w-5 h-5 text-green-500 mx-auto" />
                                            <p className="text-lg font-bold text-gray-900 mt-1">{batch.avgMoisture}%</p>
                                            <p className="text-xs text-gray-500">Soil Moisture</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {batch.farmLocation && (
                                <div className="flex items-center gap-2 text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>{batch.farmLocation}</span>
                                    {batch.zoneName && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span>{batch.zoneName}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Quantity */}
                            {batch.quantityKg && (
                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl p-3">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    <span>Batch Size: <strong>{batch.quantityKg} kg</strong></span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Blockchain Proof */}
                {isVerified && verification && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="border-0 shadow-xl mt-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                <div className="flex items-center gap-3 text-white">
                                    <Link2 className="w-6 h-6" />
                                    <div>
                                        <h3 className="font-bold">Blockchain Proof</h3>
                                        <p className="text-white/70 text-sm">Immutable record on Polygon Network</p>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Data Integrity</span>
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="font-medium">Valid</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Network</span>
                                        <span className="font-medium text-gray-900">Polygon Amoy</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Block Number</span>
                                        <span className="font-mono text-gray-900">{verification.blockNumber?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Data Hash</span>
                                        <span className="font-mono text-xs text-gray-700">{verification.dataHash}</span>
                                    </div>

                                    {verification.explorerUrl && (
                                        <a
                                            href={verification.explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full mt-4 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View on Blockchain Explorer
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mt-6"
                >
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">
                            Powered by <strong className="text-green-600">Agroflow</strong>
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
