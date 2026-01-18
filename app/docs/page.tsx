"use client";

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import {
    Book,
    Cpu,
    Database,
    Globe,
    Key,
    Link2,
    Rocket,
    Server,
    Wifi,
    ExternalLink,
    Github,
    Bot,
    Gem,
    QrCode
} from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                            <Book className="w-4 h-4" />
                            Documentation
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Agroflow Documentation</h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Learn how to set up and use Agroflow for smart farming with IoT, blockchain, and AI.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-8 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="https://github.com/Devvaibhavpk/Agroflow" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="gap-2">
                                <Github className="w-4 h-4" />
                                GitHub Repo
                            </Button>
                        </a>
                        <Link href="/dashboard">
                            <Button variant="outline" className="gap-2">
                                <Globe className="w-4 h-4" />
                                Live Demo
                            </Button>
                        </Link>
                        <Link href="/traceability">
                            <Button variant="outline" className="gap-2">
                                <Gem className="w-4 h-4" />
                                NFT Traceability
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="getting-started" className="space-y-8">
                        <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
                            <TabsTrigger value="getting-started" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-full px-4">
                                <Rocket className="w-4 h-4 mr-2" />
                                Getting Started
                            </TabsTrigger>
                            <TabsTrigger value="iot" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-full px-4">
                                <Wifi className="w-4 h-4 mr-2" />
                                IoT Setup
                            </TabsTrigger>
                            <TabsTrigger value="blockchain" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-full px-4">
                                <Link2 className="w-4 h-4 mr-2" />
                                Blockchain
                            </TabsTrigger>
                            <TabsTrigger value="api" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-full px-4">
                                <Server className="w-4 h-4 mr-2" />
                                API Reference
                            </TabsTrigger>
                        </TabsList>

                        {/* Getting Started */}
                        <TabsContent value="getting-started" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="w-5 h-5 text-green-600" />
                                        Quick Start Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3>Prerequisites</h3>
                                    <ul>
                                        <li>Node.js 18+ and npm</li>
                                        <li>Supabase account (free tier works)</li>
                                        <li>Gemini API key (for chatbot)</li>
                                        <li>MetaMask wallet (for NFT minting)</li>
                                    </ul>

                                    <h3>Installation</h3>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                                        {`# Clone the repository
git clone https://github.com/Devvaibhavpk/Agroflow.git
cd Agroflow

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Add your keys to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# GEMINI_API_KEY=your_gemini_key

# Run development server
npm run dev`}
                                    </pre>

                                    <h3>Supabase Setup</h3>
                                    <ol>
                                        <li>Create a new Supabase project</li>
                                        <li>Run the SQL scripts in <code>/supabase</code> folder:
                                            <ul>
                                                <li><code>setup.sql</code> - Core tables</li>
                                                <li><code>blockchain_tables.sql</code> - NFT/blockchain tables</li>
                                                <li><code>sample_data.sql</code> - Demo data</li>
                                            </ul>
                                        </li>
                                        <li>Copy your project URL and anon key to <code>.env.local</code></li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="w-5 h-5 text-green-600" />
                                        Environment Variables
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3 font-semibold">Variable</th>
                                                    <th className="text-left p-3 font-semibold">Description</th>
                                                    <th className="text-left p-3 font-semibold">Required</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3 font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</td>
                                                    <td className="p-3">Your Supabase project URL</td>
                                                    <td className="p-3">✅ Yes</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3 font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                                                    <td className="p-3">Supabase anonymous key</td>
                                                    <td className="p-3">✅ Yes</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3 font-mono text-sm">GEMINI_API_KEY</td>
                                                    <td className="p-3">Google Gemini API key for chatbot</td>
                                                    <td className="p-3">✅ Yes</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3 font-mono text-sm">NEXT_PUBLIC_NFT_CONTRACT_ADDRESS</td>
                                                    <td className="p-3">Deployed NFT contract address</td>
                                                    <td className="p-3">Optional</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* IoT Setup */}
                        <TabsContent value="iot" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-green-600" />
                                        ESP32 Hardware Setup
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3>Required Components</h3>
                                    <ul>
                                        <li>ESP32 development board</li>
                                        <li>DHT22 sensor (temperature/humidity)</li>
                                        <li>Soil moisture sensor</li>
                                        <li>5V relay module (for pump control)</li>
                                        <li>Water pump (optional)</li>
                                    </ul>

                                    <h3>Wiring Diagram</h3>
                                    <div className="bg-gray-100 p-4 rounded-xl font-mono text-sm">
                                        <p>ESP32 GPIO Pins:</p>
                                        <ul>
                                            <li>GPIO 4 → DHT22 Data Pin</li>
                                            <li>GPIO 34 → Soil Moisture Sensor</li>
                                            <li>GPIO 26 → Relay IN (Pump Control)</li>
                                        </ul>
                                    </div>

                                    <h3>Arduino Code</h3>
                                    <p>Upload the ESP32 firmware to send sensor data to Supabase:</p>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                                        {`// ESP32 sends data to Supabase every 30 seconds
// Configure WiFi and Supabase credentials
#define WIFI_SSID "your_wifi"
#define WIFI_PASSWORD "your_password"
#define SUPABASE_URL "your_supabase_url"
#define SUPABASE_KEY "your_anon_key"`}
                                    </pre>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="w-5 h-5 text-green-600" />
                                        Sensor Data Schema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
                                        {`CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  moisture DECIMAL(5,2),
  motor_state BOOLEAN DEFAULT false,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Blockchain */}
                        <TabsContent value="blockchain" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Link2 className="w-5 h-5 text-purple-600" />
                                        NFT Traceability System
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3>Overview</h3>
                                    <p>
                                        Agroflow uses ERC-721 NFTs on Polygon blockchain to create immutable
                                        certificates for each harvest batch. Consumers can verify product
                                        authenticity by scanning QR codes.
                                    </p>

                                    <h3>Smart Contract</h3>
                                    <p>The contract is located at <code>/contracts/AgroflowNFT.sol</code></p>
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm">
                                        {`// Key functions
function mintBatch(
  address to,
  string memory qrCodeId,
  bytes32 dataHash,
  string memory uri
) public returns (uint256)

function getTokenByQrCode(string memory qrCodeId) 
  public view returns (uint256)

function verifyIntegrity(uint256 tokenId, bytes32 dataHash) 
  public view returns (bool)`}
                                    </pre>

                                    <h3>Deploy to Polygon Amoy Testnet</h3>
                                    <ol>
                                        <li>Get test MATIC from <a href="https://faucet.polygon.technology" className="text-purple-600">faucet.polygon.technology</a></li>
                                        <li>Open <a href="https://remix.ethereum.org" className="text-purple-600">Remix IDE</a></li>
                                        <li>Upload <code>AgroflowNFT.sol</code> and compile</li>
                                        <li>Deploy using Injected Provider (MetaMask)</li>
                                        <li>Copy contract address to <code>.env.local</code></li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="w-5 h-5 text-purple-600" />
                                        QR Code Verification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose max-w-none">
                                    <h3>How It Works</h3>
                                    <ol>
                                        <li>Farmer creates harvest batch with crop details</li>
                                        <li>System generates unique QR code ID (e.g., <code>AF-X7K9M2</code>)</li>
                                        <li>Batch data is hashed using SHA-256</li>
                                        <li>NFT is minted with hash stored on-chain</li>
                                        <li>QR code links to <code>/verify/[qrCodeId]</code></li>
                                    </ol>

                                    <h3>Consumer Verification Page</h3>
                                    <p>Visit <Link href="/verify/AF-DEMO-001" className="text-purple-600">/verify/AF-DEMO-001</Link> to see a demo verification page.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* API Reference */}
                        <TabsContent value="api" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Server className="w-5 h-5 text-green-600" />
                                        API Endpoints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Harvest API */}
                                        <div className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                                                <code className="font-mono">/api/harvest</code>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">Fetch all harvest batches for the authenticated user</p>
                                        </div>

                                        <div className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                                                <code className="font-mono">/api/harvest</code>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">Create a new harvest batch</p>
                                            <pre className="bg-gray-100 p-2 rounded text-xs">
                                                {`{
  "crop_name": "Tomatoes",
  "planting_date": "2024-10-15",
  "quantity_kg": 250
}`}
                                            </pre>
                                        </div>

                                        <div className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-mono">PUT</span>
                                                <code className="font-mono">/api/harvest</code>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">Update batch or mint as NFT</p>
                                            <pre className="bg-gray-100 p-2 rounded text-xs">
                                                {`{
  "id": "batch-uuid",
  "mintNft": true  // Triggers NFT minting
}`}
                                            </pre>
                                        </div>

                                        {/* Verify API */}
                                        <div className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                                                <code className="font-mono">/api/verify?qr_code_id=AF-X7K9M2</code>
                                            </div>
                                            <p className="text-gray-600 text-sm">Verify batch by QR code ID (public endpoint)</p>
                                        </div>

                                        {/* Ask API */}
                                        <div className="border rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                                                <code className="font-mono">/api/ask</code>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">AgriBot AI chatbot endpoint</p>
                                            <pre className="bg-gray-100 p-2 rounded text-xs">
                                                {`{
  "question": "Should I water my crops?",
  "language": "english"
}`}
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
                    <p className="text-gray-600 mb-6">Check out the GitHub repo or try the live demo</p>
                    <div className="flex justify-center gap-4">
                        <a href="https://github.com/Devvaibhavpk/Agroflow" target="_blank" rel="noopener noreferrer">
                            <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
                                <Github className="w-4 h-4" />
                                GitHub
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                        </a>
                        <Link href="/chatbot">
                            <Button variant="outline" className="gap-2">
                                <Bot className="w-4 h-4" />
                                Ask AgriBot
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
