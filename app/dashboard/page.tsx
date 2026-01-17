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
  WifiOff
} from 'lucide-react';

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



export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prepare data for charts using useMemo to optimize performance
  const temperatureData = useMemo(() => {
    return sensorData.map(data => ({
      time: new Date(data.inserted_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: data.temperature
    })).sort((a, b) => {
      // Ensure data is sorted chronologically
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
      humidity: data.humidity // Fixed: now using actual humidity data
    })).sort((a, b) => {
      // Ensure data is sorted chronologically
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });
  }, [sensorData]);

  // Fetch latest sensor data and setup real-time subscription
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        setLoading(true);
        
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
      }
    };

    // Initial fetch
    fetchLatestData();

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
          
          // Update historical data
          setSensorData(prevData => {
            const updatedData = [...prevData, newData];
            // Keep only last 24 hours of data
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return updatedData.filter(item => 
              new Date(item.inserted_at) >= twentyFourHoursAgo
            );
          });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Handle pump status change
  const handlePumpStatusChange = async (newStatus: boolean) => {
    try {
      // You would typically call a backend function to actually control the pump
      setPumpStatus(newStatus);
    } catch (err) {
      console.error('Error changing pump status:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Status Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Farm Monitoring Dashboard</h1>
        <div className={`flex items-center gap-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <span className="font-medium">
            ESP32 {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Live Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Temperature
            </CardTitle>
            <Thermometer className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestData ? `${latestData.temperature.toFixed(1)}°C` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">±0.5°C accuracy</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Humidity
            </CardTitle>
            <Droplets className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestData ? `${latestData.humidity.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Indoor equivalent</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Soil Moisture
            </CardTitle>
            <Leaf className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestData ? `${latestData.moisture.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Field capacity</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Water Pump
            </CardTitle>
            <Zap className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-3xl font-bold ${pumpStatus ? 'text-green-600' : 'text-gray-400'}`}>
                {pumpStatus ? 'ON' : 'OFF'}
              </div>
              <Switch
                checked={pumpStatus}
                onCheckedChange={handlePumpStatusChange}
                disabled={!isOnline}
              />
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {!isOnline && 'Device offline'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphical Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Temperature Trends (24h)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {temperatureData.length > 0 ? (
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit="°C" />
                  <Tooltip />
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

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Humidity Trends (24h)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {humidityData.length > 0 ? (
                <LineChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit="%" />
                  <Tooltip />
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

        

        
      </div>
    </div>
  );
}