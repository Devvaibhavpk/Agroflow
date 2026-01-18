"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, slideIn, zoomIn } from "@/utils/motion";
import { useAuth } from "@/components/AuthProvider";
import Link from 'next/link';
import {
  Droplets,
  Sun,
  Leaf,
  BarChart3,
  Wifi,
  Smartphone,
  Shield,
  QrCode,
  Link2,
  Gem,
  Bot,
  Sprout
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  const features = [
    {
      title: "Real-Time Monitoring",
      description: "Track soil moisture, temperature, and humidity instantly with IoT sensors.",
      icon: Wifi,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Blockchain Traceability",
      description: "Mint harvest batches as NFTs on Polygon for immutable provenance tracking.",
      icon: Link2,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "AI-Powered Insights",
      description: "Get farming recommendations from our AgriBot powered by Gemini AI.",
      icon: Bot,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const traceabilityFeatures = [
    {
      title: "NFT Certificates",
      description: "Each harvest batch becomes an ERC-721 NFT with verified origin data.",
      icon: Gem,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "QR Code Stickers",
      description: "Generate printable QR codes for product packaging verification.",
      icon: QrCode,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Consumer Verification",
      description: "Customers scan QR to see growing conditions and authenticity proof.",
      icon: Shield,
      color: "bg-green-100 text-green-600"
    }
  ];

  const additionalFeatures = [
    {
      title: "Weather Integration",
      description: "Accurate weather forecasts to plan your farming activities.",
      icon: Sun
    },
    {
      title: "Crop Health",
      description: "AI-powered disease detection and crop health monitoring.",
      icon: Leaf
    },
    {
      title: "Mobile Access",
      description: "Monitor and control your farm from anywhere, anytime.",
      icon: Smartphone
    },
    {
      title: "Smart Irrigation",
      description: "Automated water management based on sensor data.",
      icon: Droplets
    },
    {
      title: "Harvest Tracking",
      description: "Complete lifecycle management from seed to sale.",
      icon: Sprout
    },
    {
      title: "Analytics Dashboard",
      description: "Visualize trends and optimize your farming operations.",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-gray-50 overflow-hidden">
      {/* Hero Section */}
      <motion.main
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container mx-auto py-20 grid md:grid-cols-2 gap-10 items-center relative px-4"
      >
        {/* Decorative Blobs */}
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <motion.div
          variants={fadeIn('right', 'spring', 0.2, 1.5)}
          className="space-y-8 z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-purple-100 text-green-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            IoT + Blockchain + AI
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Smart Farming <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-purple-500">
              Meets Blockchain
            </span>
          </h1>

          <motion.p
            variants={fadeIn('up', 'spring', 0.4, 1)}
            className="text-xl text-gray-600 max-w-lg"
          >
            Transform your farm with Agroflow – IoT monitoring, NFT-based traceability, and AI-powered insights for the modern farmer.
          </motion.p>

          <motion.div
            variants={fadeIn('up', 'spring', 0.6, 1)}
            className="flex flex-wrap gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard">
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-green-500/25"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/traceability">
                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-white/60 border-purple-300 text-purple-600 rounded-full px-8 py-6 text-lg shadow-md hover:bg-purple-50"
                >
                  <Gem className="w-5 h-5 mr-2" />
                  Mint NFT
                </Button>
              </Link>
            </motion.div>

            {!isLoading && !user && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="backdrop-blur-sm bg-white/60 border-green-300 text-green-600 rounded-full px-8 py-6 text-lg shadow-md hover:bg-white/80"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-3 py-1.5 rounded-full">
              <Gem className="w-4 h-4 text-purple-500" />
              <span>NFT Certificates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-3 py-1.5 rounded-full">
              <Bot className="w-4 h-4 text-blue-500" />
              <span>AI Assistant</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={slideIn('left', 'spring', 0.5, 1.5)}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-purple-400/20 rounded-3xl blur-2xl"></div>
          <Image
            src="/landingImage.jpg"
            alt="Smart Farm with Blockchain"
            width={600}
            height={400}
            className="rounded-3xl transform hover:scale-105 transition-transform duration-500 shadow-2xl relative z-10"
          />
        </motion.div>
      </motion.main>

      {/* Main Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="container mx-auto text-center mb-16 relative z-10 px-4"
        >
          <motion.div
            variants={fadeIn('up', 'spring', 0.2, 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6"
          >
            Core Platform Features
          </motion.div>

          <motion.h2
            variants={fadeIn('up', 'spring', 0.3, 1)}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 mb-6"
          >
            Three Pillars of Modern Farming
          </motion.h2>

          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="container mx-auto grid md:grid-cols-3 gap-8 mt-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn('up', 'spring', index * 0.2, 1)}
              >
                <motion.div whileHover={{ y: -10, scale: 1.02 }}>
                  <Card className="backdrop-blur-lg bg-white/80 border border-white/50 shadow-xl rounded-3xl h-full overflow-hidden group">
                    <CardHeader className="relative z-10 pt-8">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Blockchain Traceability Section - NEW */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
        <div className="absolute -right-32 top-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <Gem className="w-4 h-4" />
              Blockchain Powered
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-6">
              NFT-Based Traceability
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every harvest batch is minted as an NFT on Polygon blockchain, providing immutable proof of origin that consumers can verify by scanning a QR code.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {traceabilityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/traceability">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-8 py-6 text-lg shadow-lg">
                <Link2 className="w-5 h-5 mr-2" />
                Start Tracing Your Harvest
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn('up', 'spring', index * 0.1, 1)}
                whileHover={{ y: -5 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        variants={zoomIn(0.5, 1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container mx-auto py-24 text-center relative z-10 px-4"
      >
        <div className="grid md:grid-cols-4 gap-6 backdrop-blur-xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

          {[
            { value: "50%", label: "Water Savings", sublabel: "Average reduction" },
            { value: "24/7", label: "Real-Time Data", sublabel: "Always connected" },
            { value: "100%", label: "Tamper-Proof", sublabel: "Blockchain verified" },
            { value: "30%", label: "Yield Increase", sublabel: "Reported by farmers" }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 relative z-10"
            >
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-white">{stat.value}</div>
                <div className="text-white/90 text-lg font-medium">{stat.label}</div>
                <div className="text-white/60 text-sm">{stat.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-purple-50"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto text-center relative z-10 px-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join farmers who are using Agroflow for smart irrigation, blockchain traceability, and AI-powered insights.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={user ? "/dashboard" : "/signup"}>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-10 py-6 text-lg shadow-lg shadow-green-500/25">
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="outline" className="rounded-full px-10 py-6 text-lg border-gray-300">
                <Bot className="w-5 h-5 mr-2" />
                Try AgriBot AI
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}