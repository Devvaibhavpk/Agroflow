"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Wallet,
    ChevronDown,
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    isMetaMaskInstalled,
    connectWallet,
    switchToPolygonAmoy,
    setupWalletListeners,
    WalletState,
    NETWORKS
} from '@/lib/wallet';

interface WalletConnectProps {
    onConnect?: (wallet: WalletState) => void;
    onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
    const [wallet, setWallet] = useState<WalletState>({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null
    });
    const [connecting, setConnecting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

    // Check if on correct network
    useEffect(() => {
        if (wallet.chainId) {
            setIsCorrectNetwork(wallet.chainId === NETWORKS['polygon-amoy'].chainId);
        }
    }, [wallet.chainId]);

    // Setup wallet listeners
    useEffect(() => {
        const cleanup = setupWalletListeners(
            (accounts) => {
                if (accounts.length === 0) {
                    setWallet({ isConnected: false, address: null, chainId: null, balance: null });
                    onDisconnect?.();
                } else {
                    setWallet(prev => ({ ...prev, address: accounts[0] as string }));
                }
            },
            (chainId) => {
                setWallet(prev => ({ ...prev, chainId: chainId as string }));
            }
        );

        return cleanup;
    }, [onDisconnect]);

    const handleConnect = useCallback(async () => {
        if (!isMetaMaskInstalled()) {
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setConnecting(true);
        try {
            const walletState = await connectWallet();
            setWallet(walletState);
            onConnect?.(walletState);

            // Switch to Polygon Amoy if not on it
            if (walletState.chainId !== NETWORKS['polygon-amoy'].chainId) {
                await switchToPolygonAmoy();
            }
        } catch (error) {
            console.error('Failed to connect:', error);
        } finally {
            setConnecting(false);
        }
    }, [onConnect]);

    const handleSwitchNetwork = async () => {
        try {
            await switchToPolygonAmoy();
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
    };

    const copyAddress = async () => {
        if (wallet.address) {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Not connected state
    if (!wallet.isConnected) {
        return (
            <Button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-2"
            >
                {connecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Wallet className="w-4 h-4" />
                )}
                {!isMetaMaskInstalled() ? 'Install MetaMask' : 'Connect Wallet'}
            </Button>
        );
    }

    // Connected state
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`gap-2 ${!isCorrectNetwork ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                >
                    {!isCorrectNetwork && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono">{formatAddress(wallet.address!)}</span>
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                {/* Wallet Info */}
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Connected</span>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                            Active
                        </Badge>
                    </div>
                    <p className="font-mono text-sm mt-1">{formatAddress(wallet.address!)}</p>
                    {wallet.balance && (
                        <p className="text-sm text-gray-500 mt-1">
                            {parseFloat(wallet.balance).toFixed(4)} MATIC
                        </p>
                    )}
                </div>

                <DropdownMenuSeparator />

                {/* Network Warning */}
                {!isCorrectNetwork && (
                    <>
                        <DropdownMenuItem onClick={handleSwitchNetwork} className="text-orange-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Switch to Polygon Amoy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Actions */}
                <DropdownMenuItem onClick={copyAddress}>
                    {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                    ) : (
                        <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copied!' : 'Copy Address'}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => window.open(`https://amoy.polygonscan.com/address/${wallet.address}`, '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => window.open('https://faucet.polygon.technology/', '_blank')}
                >
                    <Wallet className="w-4 h-4 mr-2" />
                    Get Test MATIC
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
