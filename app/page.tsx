"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn, slideIn, zoomIn } from "@/utils/motion";
import { useAuth } from "@/components/AuthProvider";
import Link from 'next/link';
import { Droplets, Sun, Leaf, BarChart3, Wifi, Smartphone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  const features = [
    {
      title: "Real-Time Monitoring",
      description: "Track soil moisture, weather conditions, and crop health instantly with IoT sensors.",
      icon: Wifi,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Irrigation",
      description: "Optimize water usage with AI-powered precision irrigation techniques.",
      icon: Droplets,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Data Insights",
      description: "Receive actionable insights backed by machine learning to improve productivity.",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500"
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/30 to-gray-50 overflow-hidden">
      {/* Hero Section - Enhanced with Glassmorphism */}
      <motion.main
        variants={staggerContainer(0.1, 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container mx-auto py-20 grid md:grid-cols-2 gap-10 items-center relative px-4"
      >
        {/* Decorative Blobs */}
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute left-1/2 top-1/2 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <motion.div
          variants={fadeIn('right', 'spring', 0.2, 1.5)}
          className="space-y-8 z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Smart Farming Revolution
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Smart Irrigation <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
              With Agroflow
            </span>
          </h1>

          <motion.p
            variants={fadeIn('up', 'spring', 0.4, 1)}
            className="text-xl text-gray-600 max-w-lg"
          >
            Transform your farm with Agroflow – the smart solution for efficient irrigation, real-time monitoring, and AI-powered agricultural insights.
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
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Credit Card</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={slideIn('left', 'spring', 0.5, 1.5)}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-emerald-400/20 rounded-3xl blur-2xl"></div>
          <Image
            src="/landingImage.jpg"
            alt="Smart Farm Irrigation"
            width={600}
            height={400}
            className="rounded-3xl transform hover:scale-105 transition-transform duration-500 shadow-2xl relative z-10"
          />
        </motion.div>
      </motion.main>

      {/* Features Section - Enhanced */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="absolute -left-32 top-1/2 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

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
            Why Choose Us
          </motion.div>

          <motion.h2
            variants={fadeIn('up', 'spring', 0.3, 1)}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 mb-6"
          >
            Powerful Features
          </motion.h2>
          <motion.p
            variants={fadeIn('up', 'spring', 0.4, 1)}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Agroflow combines IoT, AI, and modern technology to revolutionize agricultural monitoring and management.
          </motion.p>

          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="container mx-auto grid md:grid-cols-3 gap-8 mt-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 'spring', index * 0.2, 1)}
              >
                <motion.div whileHover={{ y: -10, scale: 1.02 }}>
                  <Card
                    className="backdrop-blur-lg bg-white/80 border border-white/50 shadow-xl rounded-3xl h-full overflow-hidden group"
                  >
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
                key={index}
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

      {/* Stats Section - Enhanced */}
      <motion.section
        variants={zoomIn(0.5, 1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="container mx-auto py-24 text-center relative z-10 px-4"
      >
        <div className="grid md:grid-cols-3 gap-8 backdrop-blur-xl bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

          {[
            { value: "50%", label: "Water Savings", sublabel: "Average reduction" },
            { value: "24/7", label: "Real-Time Monitoring", sublabel: "Always connected" },
            { value: "30%", label: "Yield Increase", sublabel: "Reported by farmers" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20 relative z-10"
            >
              <div className="space-y-2">
                <div className="text-5xl md:text-6xl font-bold text-white">{stat.value}</div>
                <div className="text-white/90 text-lg font-medium">{stat.label}</div>
                <div className="text-white/60 text-sm">{stat.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"></div>
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
            Join thousands of farmers who are already using Agroflow to optimize their irrigation and increase yields.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={user ? "/dashboard" : "/signup"}>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-10 py-6 text-lg shadow-lg shadow-green-500/25">
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="rounded-full px-10 py-6 text-lg border-gray-300">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}