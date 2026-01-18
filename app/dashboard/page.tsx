/* eslint-disable @next/next/no-img-element */
"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Leaf,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  CloudRain,
  Sun,
  Sprout,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Lazy Supabase client creation to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return null;
}

// Static demo data for when database is unavailable
const DEMO_SENSOR_DATA: SensorData[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  temperature: 25 + Math.sin(i / 3) * 5 + Math.random() * 2,
  humidity: 60 + Math.cos(i / 4) * 10 + Math.random() * 5,
  moisture: 45 + Math.sin(i / 5) * 15 + Math.random() * 3,
  motor_state: i % 8 === 0,
  inserted_at: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString()
}));

const DEMO_WEATHER: WeatherData = {
  location: { name: 'Chennai' },
  current: {
    temp_c: 28,
    humidity: 65,
    condition: { text: 'Partly Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/116.png' },
    wind_kph: 12,
    feelslike_c: 30
  },
  forecast: {
    forecastday: [
      { date: new Date().toISOString(), day: { maxtemp_c: 32, mintemp_c: 22, daily_chance_of_rain: 20, condition: { text: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' } } },
      { date: new Date(Date.now() + 86400000).toISOString(), day: { maxtemp_c: 30, mintemp_c: 21, daily_chance_of_rain: 45, condition: { text: 'Cloudy', icon: '//cdn.weatherapi.com/weather/64x64/day/119.png' } } },
      { date: new Date(Date.now() + 172800000).toISOString(), day: { maxtemp_c: 29, mintemp_c: 20, daily_chance_of_rain: 60, condition: { text: 'Rain', icon: '//cdn.weatherapi.com/weather/64x64/day/296.png' } } }
    ]
  }
};

const DEMO_RECOMMENDATIONS: CropRecommendation[] = [
  {
    name: 'Tomatoes',
    category: 'vegetables',
    matchScore: 92,
    reasons: ['Ideal temperature range', 'Good soil moisture', 'Season is favorable'],
    tips: ['Water early morning', 'Provide support stakes'],
    daysToHarvest: 70,
    waterRequirement: 'Medium'
  },
  {
    name: 'Spinach',
    category: 'leafy greens',
    matchScore: 88,
    reasons: ['Cool weather crop', 'Moisture levels optimal', 'Fast growing'],
    tips: ['Harvest outer leaves first', 'Keep soil moist'],
    daysToHarvest: 45,
    waterRequirement: 'High'
  },
  {
    name: 'Peppers',
    category: 'vegetables',
    matchScore: 85,
    reasons: ['Warm conditions suitable', 'Well-drained soil', 'Long growing season'],
    tips: ['Mulch to retain moisture', 'Fertilize regularly'],
    daysToHarvest: 90,
    waterRequirement: 'Medium'
  }
];

const DEMO_ALERTS: Alert[] = [
  { id: '1', type: 'moisture', severity: 'warning', title: 'Low Soil Moisture', message: 'Zone A moisture dropped below 30%', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', type: 'temperature', severity: 'info', title: 'Temperature Rising', message: 'Temperature increasing steadily today', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() }
];

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  moisture: number;
  motor_state: boolean;
  inserted_at: string;
}

interface WeatherData {
  location: { name: string };
  current: {
    temp_c: number;
    humidity: number;
    condition: { text: string; icon: string };
    wind_kph: number;
    feelslike_c: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        condition: { text: string; icon: string };
      };
    }>;
  };
}

interface CropRecommendation {
  name: string;
  category: string;
  matchScore: number;
  reasons: string[];
  tips: string[];
  daysToHarvest: number;
  waterRequirement: string;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate trends
  const trends = useMemo(() => {
    if (sensorData.length < 2) return { temperature: 0, humidity: 0, moisture: 0 };

    const recent = sensorData.slice(-5);
    const older = sensorData.slice(-10, -5);

    const avgRecent = {
      temperature: recent.reduce((a, b) => a + b.temperature, 0) / recent.length,
      humidity: recent.reduce((a, b) => a + b.humidity, 0) / recent.length,
      moisture: recent.reduce((a, b) => a + b.moisture, 0) / recent.length,
    };

    const avgOlder = older.length > 0 ? {
      temperature: older.reduce((a, b) => a + b.temperature, 0) / older.length,
      humidity: older.reduce((a, b) => a + b.humidity, 0) / older.length,
      moisture: older.reduce((a, b) => a + b.moisture, 0) / older.length,
    } : avgRecent;

    return {
      temperature: avgRecent.temperature - avgOlder.temperature,
      humidity: avgRecent.humidity - avgOlder.humidity,
      moisture: avgRecent.moisture - avgOlder.moisture,
    };
  }, [sensorData]);

  // Chart data
  const temperatureData = useMemo(() => {
    return sensorData.slice(-24).map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: data.temperature,
      humidity: data.humidity
    }));
  }, [sensorData]);

  const moistureData = useMemo(() => {
    return sensorData.slice(-24).map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moisture: data.moisture
    }));
  }, [sensorData]);

  // Use demo data as fallback
  const useDemoData = () => {
    const demoLatest = DEMO_SENSOR_DATA[DEMO_SENSOR_DATA.length - 1];
    setLatestData(demoLatest);
    setSensorData(DEMO_SENSOR_DATA);
    setPumpStatus(demoLatest.motor_state);
    setWeather(DEMO_WEATHER);
    setRecommendations(DEMO_RECOMMENDATIONS);
    setAlerts(DEMO_ALERTS);
    setIsOnline(false);
    setDemoMode(true);
    setLoading(false);
  };

  // Fetch all data
  const fetchData = async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Use demo data when database is not configured
      console.log('Database not configured, using demo data');
      useDemoData();
      return;
    }

    try {
      setRefreshing(true);

      // Fetch sensor data
      const { data, error: fetchError } = await supabase
        .from('sensordata')
        .select('*')
        .order('inserted_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setLatestData(data);
        setPumpStatus(data.motor_state);
        setIsOnline(true);
      }

      // Fetch historical data
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: historicalData } = await supabase
        .from('sensordata')
        .select('*')
        .gte('inserted_at', twentyFourHoursAgo.toISOString())
        .order('inserted_at', { ascending: true });

      setSensorData(historicalData || []);

      // Fetch weather
      try {
        const weatherRes = await axios.get('/api/weather');
        setWeather(weatherRes.data);
      } catch {
        console.log('Weather fetch failed, using fallback');
        setWeather(DEMO_WEATHER);
      }

      // Fetch recommendations
      if (data) {
        try {
          const recRes = await axios.get(`/api/recommendations?temperature=${data.temperature}&moisture=${data.moisture}`);
          setRecommendations(recRes.data.recommendations || []);
        } catch {
          console.log('Recommendations fetch failed');
          setRecommendations(DEMO_RECOMMENDATIONS);
        }
      }

      // Fetch alerts
      try {
        const alertRes = await axios.get('/api/alerts?limit=5');
        setAlerts(alertRes.data.alerts || []);
      } catch {
        console.log('Alerts fetch failed');
        setAlerts(DEMO_ALERTS);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data, using demo data:', err);
      // Fallback to demo data instead of showing error
      useDemoData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const subscription = supabase
      .channel('sensordata')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensordata' },
        (payload) => {
          const newData = payload.new as SensorData;
          setLatestData(newData);
          setPumpStatus(newData.motor_state);
          setIsOnline(true);
          setSensorData(prev => [...prev.slice(-48), newData]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handlePumpStatusChange = async (newStatus: boolean) => {
    setPumpStatus(newStatus);
    // In production, send command to ESP32
  };

  const TrendIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
    if (Math.abs(value) < 0.1) return <span className="text-gray-400 text-xs">Stable</span>;
    return (
      <span className={`flex items-center text-xs ${value > 0 ? 'text-orange-500' : 'text-green-500'}`}>
        {value > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(value).toFixed(1)}{suffix}
      </span>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your farm dashboard...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-500">Real-time monitoring & smart insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            ESP32 {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-green-600 transition-colors" />
            {alerts.filter(a => !a.is_read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {alerts.filter(a => !a.is_read).length}
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <Activity className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <Sprout className="w-4 h-4" /> Crops
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <Bell className="w-4 h-4" /> Alerts
            {alerts.filter(a => !a.is_read).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {alerts.filter(a => !a.is_read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Temperature</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {latestData?.temperature.toFixed(1)}°C
                      </p>
                      <TrendIndicator value={trends.temperature} suffix="°C" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                      <Thermometer className="w-7 h-7 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Humidity</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {latestData?.humidity.toFixed(1)}%
                      </p>
                      <TrendIndicator value={trends.humidity} />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Droplets className="w-7 h-7 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Soil Moisture</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {latestData?.moisture.toFixed(1)}%
                      </p>
                      <TrendIndicator value={trends.moisture} />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                      <Leaf className="w-7 h-7 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Water Pump</p>
                      <p className={`text-4xl font-bold ${pumpStatus ? 'text-green-600' : 'text-gray-400'}`}>
                        {pumpStatus ? 'ON' : 'OFF'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {pumpStatus ? 'Running' : 'Standby'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
                        <Zap className="w-7 h-7 text-yellow-600" />
                      </div>
                      <Switch
                        checked={pumpStatus}
                        onCheckedChange={handlePumpStatusChange}
                        disabled={!isOnline}
                        className="data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Weather & Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weather ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">{weather.current.temp_c}°C</p>
                          <p className="text-gray-500">{weather.current.condition.text}</p>
                        </div>
                        {weather.current.condition.icon && (
                          <img
                            src={`https:${weather.current.condition.icon}`}
                            alt={weather.current.condition.text}
                            className="w-16 h-16"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          {weather.current.humidity}% Humidity
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          Feels {weather.current.feelslike_c}°C
                        </div>
                      </div>
                      {weather.forecast && (
                        <div className="flex gap-2 pt-2 border-t">
                          {weather.forecast.forecastday.map((day, i) => (
                            <div key={i} className="flex-1 text-center p-2 rounded-lg bg-gray-50">
                              <p className="text-xs text-gray-500">
                                {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                              </p>
                              <img
                                src={`https:${day.day.condition.icon}`}
                                alt=""
                                className="w-8 h-8 mx-auto"
                              />
                              <p className="text-xs font-medium">
                                {day.day.maxtemp_c}° / {day.day.mintemp_c}°
                              </p>
                              {day.day.daily_chance_of_rain > 30 && (
                                <div className="flex items-center justify-center gap-1 text-[10px] text-blue-600">
                                  <CloudRain className="w-3 h-3" />
                                  {day.day.daily_chance_of_rain}%
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CloudRain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Weather data unavailable</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Smart Insights
                  </CardTitle>
                  <CardDescription>AI-powered recommendations based on current conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {latestData && latestData.moisture < 35 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Low Soil Moisture</p>
                          <p className="text-sm text-yellow-600">Consider starting irrigation. Current level: {latestData.moisture.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                    {latestData && latestData.temperature > 35 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                        <Thermometer className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">High Temperature Alert</p>
                          <p className="text-sm text-red-600">Crops may experience heat stress. Consider shade nets or extra irrigation.</p>
                        </div>
                      </div>
                    )}
                    {recommendations.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                        <Sprout className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Recommended Crops</p>
                          <p className="text-sm text-green-600">
                            Based on conditions: {recommendations.slice(0, 3).map(r => r.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    {latestData && latestData.moisture >= 35 && latestData.temperature <= 35 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Optimal Conditions</p>
                          <p className="text-sm text-blue-600">All parameters are within healthy ranges. Great job!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Blockchain Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Blockchain & AI
                </CardTitle>
                <CardDescription>Quick access to traceability and AI features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a href="/traceability" className="flex items-center gap-3 p-4 rounded-xl bg-white hover:bg-purple-50 border border-purple-100 transition-all hover:shadow-md group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">NFT Traceability</p>
                      <p className="text-xs text-gray-500">Mint harvest batches</p>
                    </div>
                  </a>
                  <a href="/chatbot" className="flex items-center gap-3 p-4 rounded-xl bg-white hover:bg-green-50 border border-green-100 transition-all hover:shadow-md group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 9h.01M15 9h.01M9 15c.5.5 1.5 1 3 1s2.5-.5 3-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">AgriBot AI</p>
                      <p className="text-xs text-gray-500">Ask farming questions</p>
                    </div>
                  </a>
                  <a href="/verify/AF-DEMO-001" className="flex items-center gap-3 p-4 rounded-xl bg-white hover:bg-blue-50 border border-blue-100 transition-all hover:shadow-md group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Verify Demo</p>
                      <p className="text-xs text-gray-500">See consumer view</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    Temperature & Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={temperatureData}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="humidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#tempGradient)" strokeWidth={2} />
                        <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fill="url(#humidGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" />
                    Soil Moisture Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moistureData}>
                        <defs>
                          <linearGradient id="moistGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="moisture" stroke="#22c55e" fill="url(#moistGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Historical Analytics</CardTitle>
                <CardDescription>Detailed analysis of your farm data over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorData.slice(-48).map(d => ({
                      time: new Date(d.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      temperature: d.temperature,
                      humidity: d.humidity,
                      moisture: d.moisture
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperature (°C)" />
                      <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                      <Line type="monotone" dataKey="moisture" stroke="#22c55e" strokeWidth={2} dot={false} name="Moisture (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {recommendations.map((crop, index) => (
                <motion.div
                  key={crop.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{crop.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">{crop.category}</Badge>
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${crop.matchScore >= 80 ? 'bg-green-500' :
                          crop.matchScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}>
                          {crop.matchScore}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {crop.daysToHarvest} days
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-4 h-4" />
                          {crop.waterRequirement}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Why it&apos;s recommended:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {crop.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {crop.tips.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">Growing Tips:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {crop.tips.slice(0, 2).map((tip, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {recommendations.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recommendations available</p>
                <p className="text-sm">Connect your sensors to get AI-powered crop suggestions</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notifications & Alerts</CardTitle>
                  <CardDescription>Stay updated with your farm&apos;s status</CardDescription>
                </div>
                {alerts.filter(a => !a.is_read).length > 0 && (
                  <Button variant="outline" size="sm">Mark All as Read</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${alert.is_read ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 shadow-sm'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${alert.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                              {alert.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {alerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No alerts</p>
                    <p className="text-sm">You&apos;re all caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}