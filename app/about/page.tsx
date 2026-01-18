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
  Github
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Wifi,
      title: "IoT Sensor Integration",
      description: "ESP32-powered sensors provide real-time data on temperature, humidity, and soil moisture with laboratory-grade accuracy."
    },
    {
      icon: Droplets,
      title: "Smart Irrigation",
      description: "Automated water pump control based on soil moisture thresholds, reducing water waste by up to 50%."
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms analyze your farm data to provide crop recommendations and predict optimal harvest times."
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Beautiful dashboards with trend analysis, historical data visualization, and actionable insights."
    },
    {
      icon: Smartphone,
      title: "Multi-Language Support",
      description: "Agricultural chatbot available in 8 Indian languages, making smart farming accessible to all."
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Get notified immediately when conditions require attention - low moisture, high temperature, or system events."
    }
  ];

  const techStack = [
    { name: "Next.js 15", description: "React framework" },
    { name: "Supabase", description: "Backend & Auth" },
    { name: "ESP32", description: "IoT Hardware" },
    { name: "TailwindCSS", description: "Styling" },
    { name: "Framer Motion", description: "Animations" },
    { name: "Recharts", description: "Data Viz" },
    { name: "Gemini AI", description: "Chatbot" },
    { name: "WeatherAPI", description: "Forecasts" }
  ];

  const stats = [
    { value: "50%", label: "Water Saved" },
    { value: "30%", label: "Yield Increase" },
    { value: "24/7", label: "Monitoring" },
    { value: "8+", label: "Languages" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/20 to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-24 text-center relative z-10"
        >
         

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            The Future of Farming,<br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Agroflow combines precision agriculture with cutting-edge IoT technology
            to transform traditional farming into a data-driven, sustainable ecosystem.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-green-500/25">
                View Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
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
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white shadow-lg"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
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
              Everything you need to modernize your farm and maximize yields
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple setup, powerful results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Install Sensors", desc: "Place ESP32 sensors in your fields to monitor soil and weather conditions" },
              { step: "2", title: "Connect to Cloud", desc: "Data syncs automatically to Supabase for real-time processing and storage" },
              { step: "3", title: "Get Insights", desc: "Access your dashboard from anywhere to monitor, analyze, and control irrigation" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
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
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 rounded-full bg-white shadow-md border border-gray-100 flex items-center gap-2"
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
      <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-600 relative overflow-hidden">
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
              Join the smart farming revolution and start optimizing your agricultural operations today.
            </p>
            <Link href="/signup">
              <Button className="bg-white text-green-600 hover:bg-gray-100 rounded-full px-10 py-6 text-lg shadow-xl">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}