"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  moisture: number;
  motor_state: boolean;
  inserted_at: string;
}

// Animation variants
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
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Prepare data for charts using useMemo to optimize performance
  const temperatureData = useMemo(() => {
    return sensorData.map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      temperature: data.temperature
    })).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });
  }, [sensorData]);

  const humidityData = useMemo(() => {
    return sensorData.map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      humidity: data.humidity
    })).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });
  }, [sensorData]);

  const moistureData = useMemo(() => {
    return sensorData.map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      moisture: data.moisture
    })).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });
  }, [sensorData]);

  // Fetch latest sensor data
  const fetchData = async () => {
    try {
      setRefreshing(true);

      // Fetch the most recent sensor data
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

      // Fetch historical data for charts (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: historicalData, error: historicalError } = await supabase
        .from('sensordata')
        .select('*')
        .gte('inserted_at', twentyFourHoursAgo.toISOString())
        .order('inserted_at', { ascending: true });

      if (historicalError) throw historicalError;

      setSensorData(historicalData || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsOnline(false);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data and setup real-time subscription
  useEffect(() => {
    fetchData();

    // Setup real-time subscription
    const subscription = supabase
      .channel('sensordata')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensordata' },
        (payload) => {
          const newData = payload.new as SensorData;
          setLatestData(newData);
          setPumpStatus(newData.motor_state);
          setIsOnline(true);

          setSensorData(prevData => {
            const updatedData = [...prevData, newData];
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return updatedData.filter(item =>
              new Date(item.inserted_at) >= twentyFourHoursAgo
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Handle pump status change
  const handlePumpStatusChange = async (newStatus: boolean) => {
    try {
      setPumpStatus(newStatus);
    } catch (err) {
      console.error('Error changing pump status:', err);
    }
  };

  // Render trend indicator
  const TrendIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
    if (Math.abs(value) < 0.1) return <span className="text-gray-400 text-xs">No change</span>;

    return (
      <span className={`flex items-center text-xs ${value > 0 ? 'text-red-500' : 'text-green-500'}`}>
        {value > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(value).toFixed(1)}{suffix}
      </span>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 animate-pulse text-green-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6 min-h-[60vh] flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Status Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring & control</p>
        </div>
        <div className="flex items-center gap-4">
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
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="font-medium text-sm">
              ESP32 {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Temperature
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {latestData ? `${latestData.temperature.toFixed(1)}°C` : 'N/A'}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">±0.5°C accuracy</span>
                <TrendIndicator value={trends.temperature} suffix="°C" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Humidity
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {latestData ? `${latestData.humidity.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Indoor equivalent</span>
                <TrendIndicator value={trends.humidity} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Soil Moisture
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {latestData ? `${latestData.moisture.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Field capacity</span>
                <TrendIndicator value={trends.moisture} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Water Pump
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-4xl font-bold ${pumpStatus ? 'text-green-600' : 'text-gray-400'}`}>
                  {pumpStatus ? 'ON' : 'OFF'}
                </div>
                <Switch
                  checked={pumpStatus}
                  onCheckedChange={handlePumpStatusChange}
                  disabled={!isOnline}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {!isOnline ? 'Device offline' : pumpStatus ? 'Running' : 'Standby'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphical Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 border-0 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              Temperature (24h)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {temperatureData.length > 0 ? (
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis unit="°C" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No temperature data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 border-0 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Humidity (24h)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {humidityData.length > 0 ? (
                  <LineChart data={humidityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No humidity data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 border-0 shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Soil Moisture (24h)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {moistureData.length > 0 ? (
                  <LineChart data={moistureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="moisture"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No moisture data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}