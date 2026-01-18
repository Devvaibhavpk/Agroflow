"use client";

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import {
  Wifi,
  Droplets,
  Brain,
  Smartphone,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Github,
  Link2,
  Shield,
  QrCode,
  Gem,
  Bot,
  FileText
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Wifi,
      title: "IoT Sensor Integration",
      description: "ESP32-powered sensors provide real-time data on temperature, humidity, and soil moisture with laboratory-grade accuracy.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Link2,
      title: "Blockchain Traceability",
      description: "Each harvest batch is minted as an ERC-721 NFT on Polygon, providing immutable proof of origin and growing conditions.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Brain,
      title: "AI-Powered AgriBot",
      description: "Gemini-powered chatbot answers farming questions in 8 Indian languages with context from your sensor data.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Gem,
      title: "NFT Certificates",
      description: "Mint harvest batches as NFTs that consumers can verify by scanning QR codes on product packaging.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Beautiful dashboards with trend analysis, historical data visualization, and actionable insights.",
      color: "from-orange-500 to-amber-600"
    },
    {
      icon: Droplets,
      title: "Smart Irrigation",
      description: "Automated water pump control based on soil moisture thresholds, reducing water waste by up to 50%.",
      color: "from-teal-500 to-cyan-600"
    }
  ];

  const techStack = [
    { name: "Next.js 15", description: "React Framework" },
    { name: "Polygon", description: "Blockchain" },
    { name: "Supabase", description: "Backend" },
    { name: "ESP32", description: "IoT Hardware" },
    { name: "ethers.js", description: "Web3" },
    { name: "Gemini AI", description: "Chatbot" },
    { name: "TailwindCSS", description: "Styling" },
    { name: "MetaMask", description: "Wallet" },
    { name: "QRCode", description: "Stickers" },
    { name: "OpenSea", description: "NFT Market" }
  ];

  const stats = [
    { value: "50%", label: "Water Saved" },
    { value: "100%", label: "Tamper-Proof" },
    { value: "24/7", label: "Monitoring" },
    { value: "8+", label: "Languages" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/20 to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-24 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-purple-100 text-green-700 text-sm font-medium mb-6">
            <Link2 className="w-4 h-4" />
            IoT + Blockchain + AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Smart Farming with<br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-purple-500 bg-clip-text text-transparent">
              Blockchain Traceability
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Agroflow combines IoT sensors, NFT-based traceability on Polygon blockchain,
            and AI-powered insights to transform traditional farming into a transparent, data-driven ecosystem.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-green-500/25">
                View Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/traceability">
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-purple-300 text-purple-600 hover:bg-purple-50">
                <Gem className="mr-2 w-5 h-5" />
                NFT Traceability
              </Button>
            </Link>
            <a href="https://github.com/Devvaibhavpk/Agroflow" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg">
                <Github className="mr-2 w-5 h-5" />
                View Source
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white shadow-lg"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              IoT monitoring, blockchain traceability, and AI insights in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Blockchain Works */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              <Link2 className="w-4 h-4" />
              Blockchain Traceability
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How NFT Traceability Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From farm to consumer with blockchain-verified authenticity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", icon: Droplets, title: "Grow & Monitor", desc: "IoT sensors track temperature, humidity, and moisture throughout the growing cycle" },
              { step: "2", icon: Gem, title: "Mint NFT", desc: "Harvest batch data is hashed and minted as an ERC-721 NFT on Polygon" },
              { step: "3", icon: QrCode, title: "Print QR Code", desc: "Generate branded QR stickers linking to blockchain verification" },
              { step: "4", icon: Shield, title: "Consumer Verifies", desc: "Scanning QR shows immutable proof of origin and growing conditions" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs text-purple-600 font-medium mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built With Modern Tech
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-3 rounded-full bg-white shadow-md border border-gray-100 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium">{tech.name}</span>
                <span className="text-gray-400 text-sm">• {tech.description}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Start using blockchain-verified traceability and AI-powered insights today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-white text-green-600 hover:bg-gray-100 rounded-full px-10 py-6 text-lg shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-10 py-6 text-lg">
                  <FileText className="mr-2 w-5 h-5" />
                  Read Docs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}